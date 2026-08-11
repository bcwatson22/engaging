import fs from "fs";

import type { Browser, Page } from "puppeteer";
import type { Mock } from "vitest";

import { getBrowser } from "./getBrowser.js";
import {
  saveToPdf,
  applyFiller,
  cssPath,
  encoding,
  pdfPath,
  fillerId,
} from "./saveToPdf.js";

/* Unsorted, and with a non-stylesheet sibling, so the read order and the
   filtering are both exercised. */
const cssFilenames = ["second.css", "first.css"];

vi.mock("fs", () => ({
  default: {
    readFileSync: vi
      .fn<typeof import("fs").readFileSync>()
      .mockImplementation((path) => `Mock file: ${String(path)}`),
    readdirSync: vi
      .fn<typeof import("fs").readdirSync>()
      .mockImplementation(
        () =>
          [...cssFilenames, "not-a-stylesheet.js"] as unknown as ReturnType<
            typeof import("fs").readdirSync
          >,
      ),
  },
}));

vi.mock("./getBrowser.js", () => ({
  getBrowser: vi.fn<typeof import("./getBrowser.js").getBrowser>(),
}));

const mockPuppeteerPage = {
  addStyleTag: vi.fn<Page["addStyleTag"]>(),
  evaluate: vi.fn<Page["evaluate"]>(),
  pdf: vi.fn<Page["pdf"]>(),
  setContent: vi.fn<Page["setContent"]>(),
};
const mockPuppeteerBrowser = {
  newPage: vi
    .fn<Browser["newPage"]>()
    .mockResolvedValue(mockPuppeteerPage as unknown as Page),
  close: vi.fn<Browser["close"]>(),
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

  mockPuppeteerPage.evaluate.mockImplementation(((
    _callback: unknown,
    _id: string,
    height: number,
  ) => {
    fillerHeight = height;
  }) as unknown as Page["evaluate"]);

  mockPuppeteerPage.pdf.mockImplementation(
    () => pdfContent(fillerHeight) as unknown as ReturnType<Page["pdf"]>,
  );

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
      encoding,
    );
  });

  it("calls readdirSync to get CSS files", async () => {
    await setup();

    expect(fs.readdirSync).toHaveBeenNthCalledWith(1, cssPath);
  });

  it("calls readFileSync for every stylesheet, in a stable order", async () => {
    await setup();

    expect(fs.readFileSync).toHaveBeenNthCalledWith(
      2,
      `${cssPath}first.css`,
      encoding,
    );

    expect(fs.readFileSync).toHaveBeenNthCalledWith(
      3,
      `${cssPath}second.css`,
      encoding,
    );

    expect(fs.readFileSync).toHaveBeenCalledTimes(cssFilenames.length + 1);
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
      { waitUntil: ["networkidle0"] },
    );
  });

  it("adds cssContent and fonts to the new page", async () => {
    await setup();

    expect(mockPuppeteerPage.addStyleTag).toHaveBeenNthCalledWith(1, {
      content: `Mock file: ${cssPath}first.css\nMock file: ${cssPath}second.css`,
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
      expectedFill,
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
      expect.objectContaining({ format: "A4", path: pdfPath }),
    );
  });

  it("still saves a pdf when the page count cannot be read", async () => {
    await setup({ pdfContent: () => Buffer.from("Not a pdf") });

    expect(console.warn).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("Could not fill"),
      expect.any(Error),
    );

    expect(mockPuppeteerPage.pdf).toHaveBeenLastCalledWith(
      expect.objectContaining({ path: pdfPath }),
    );
  });

  it("still saves a pdf when the filler never spills onto a new page", async () => {
    await setup({ pdfContent: () => asPdf(3) });

    expect(console.warn).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("Could not fill"),
      expect.any(Error),
    );

    expect(mockPuppeteerPage.pdf).toHaveBeenLastCalledWith(
      expect.objectContaining({ path: pdfPath }),
    );
  });

  it("closes the puppeteer browser", async () => {
    await setup();

    expect(mockPuppeteerBrowser.close).toHaveBeenCalledTimes(1);
  });
});

describe("applyFiller", () => {
  const setupFiller = (markup: string = '<div class="wrapper"></div>') => {
    document.body.innerHTML = markup;

    return {
      wrapper: document.querySelector(".wrapper"),
      filler: () => document.getElementById(fillerId),
    };
  };

  it("appends a hidden filler of the given height to the wrapper", () => {
    const { wrapper, filler } = setupFiller();

    applyFiller(fillerId, 855);

    expect(filler()).toBe(wrapper?.lastElementChild);
    expect(filler()).toHaveAttribute("aria-hidden", "true");
    expect(filler()).toHaveStyle({ height: "855px" });
  });

  it("resizes the existing filler rather than adding another", () => {
    const { wrapper, filler } = setupFiller();

    applyFiller(fillerId, 855);
    applyFiller(fillerId, 170);

    expect(wrapper?.children).toHaveLength(1);
    expect(filler()).toHaveStyle({ height: "170px" });
  });

  it("does nothing when there is no wrapper to fill", () => {
    const { filler } = setupFiller("<div></div>");

    applyFiller(fillerId, 855);

    expect(filler()).toBeNull();
  });
});
