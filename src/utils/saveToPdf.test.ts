import fs from "fs";

import type { Mock } from "vitest";

import { getBrowser } from "./getBrowser.js";
import { saveToPdf, cssPath, encoding, pdfPath, fillerId } from "./saveToPdf.js";

vi.mock("fs", () => ({
  default: {
    readFileSync: vi.fn().mockImplementation(() => "Mock file"),
    readdirSync: vi.fn().mockImplementation(() => ["Mock directory"]),
  },
}));

vi.mock("./getBrowser.js", () => ({
  getBrowser: vi.fn(),
}));

const mockPuppeteerPage = {
  addStyleTag: vi.fn(),
  evaluate: vi.fn(),
  pdf: vi.fn(),
  setContent: vi.fn(),
};
const mockPuppeteerBrowser = {
  newPage: vi.fn().mockResolvedValue(mockPuppeteerPage),
  close: vi.fn(),
};

const mockFile = "Mock file";

/* Stands in for Chrome's A4 fragmentation: the content spans three pages and
   leaves 855px of the last one empty. */
const pageHeight = 1085;
const contentHeight = 2400;
const expectedFill = 855;

const asPdf = (pageCount: number): Buffer =>
  Buffer.from(`%PDF-1.4\n<</Type /Pages\n/Count ${pageCount}\n/Kids []>>`);

const fragmented = (fillerHeight: number): Buffer =>
  asPdf(Math.ceil((contentHeight + fillerHeight) / pageHeight));

type Options = {
  pdfContent?: (fillerHeight: number) => Buffer;
};

const setup = async ({ pdfContent = fragmented }: Options = {}) => {
  let fillerHeight = 0;

  (getBrowser as Mock).mockResolvedValue(mockPuppeteerBrowser);

  mockPuppeteerPage.evaluate.mockImplementation(
    (_callback: unknown, _id: string, height: number) => {
      fillerHeight = height;
    }
  );

  mockPuppeteerPage.pdf.mockImplementation(() => pdfContent(fillerHeight));

  await saveToPdf();
};

describe("saveToPdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  it("calls readFileSync to get htmlContent", async () => {
    await setup();

    expect(fs.readFileSync).toHaveBeenNthCalledWith(
      1,
      ".next/server/app/cv.html",
      encoding
    );
  });

  it("calls readdirSync to get CSS files", async () => {
    await setup();

    expect(fs.readdirSync).toHaveBeenNthCalledWith(1, cssPath);
  });

  it("calls readFileSync to get cssContent", async () => {
    await setup();

    expect(fs.readFileSync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining(cssPath),
      encoding
    );
  });

  it("calls getBrowser and creates a new page", async () => {
    await setup();

    expect(getBrowser).toHaveBeenCalledTimes(1);

    expect(mockPuppeteerBrowser.newPage).toHaveBeenCalledTimes(1);
  });

  it("injects the htmlContent to the new page", async () => {
    await setup();

    expect(mockPuppeteerPage.setContent).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(mockFile),
      { waitUntil: ["networkidle0"] }
    );
  });

  it("adds cssContent and fonts to the new page", async () => {
    await setup();

    expect(mockPuppeteerPage.addStyleTag).toHaveBeenNthCalledWith(1, {
      content: expect.stringContaining(mockFile),
    });

    expect(mockPuppeteerPage.addStyleTag).toHaveBeenNthCalledWith(2, {
      content: expect.stringContaining("fonts"),
    });
  });

  it("grows the filler to fill the space left on the last page", async () => {
    await setup();

    expect(mockPuppeteerPage.evaluate).toHaveBeenLastCalledWith(
      expect.any(Function),
      fillerId,
      expectedFill
    );
  });

  it("stops short of pushing the content onto another page", async () => {
    await setup();

    expect(fragmented(expectedFill)).toStrictEqual(asPdf(3));
    expect(fragmented(expectedFill + 1)).toStrictEqual(asPdf(4));
  });

  it("saves the filled pdf of the new page", async () => {
    await setup();

    expect(mockPuppeteerPage.pdf).toHaveBeenLastCalledWith(
      expect.objectContaining({ format: "A4", path: pdfPath })
    );
  });

  it("still saves a pdf when the page count cannot be read", async () => {
    await setup({ pdfContent: () => Buffer.from("Not a pdf") });

    expect(console.warn).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("Could not fill"),
      expect.any(Error)
    );

    expect(mockPuppeteerPage.pdf).toHaveBeenLastCalledWith(
      expect.objectContaining({ path: pdfPath })
    );
  });

  it("still saves a pdf when the filler never spills onto a new page", async () => {
    await setup({ pdfContent: () => asPdf(3) });

    expect(console.warn).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("Could not fill"),
      expect.any(Error)
    );

    expect(mockPuppeteerPage.pdf).toHaveBeenLastCalledWith(
      expect.objectContaining({ path: pdfPath })
    );
  });

  it("closes the puppeteer browser", async () => {
    await setup();

    expect(mockPuppeteerBrowser.close).toHaveBeenCalledTimes(1);
  });
});
