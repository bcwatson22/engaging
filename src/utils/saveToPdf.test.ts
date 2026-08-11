import type { Browser, Page } from "puppeteer";
import type { Mock } from "vitest";

import { getBrowser } from "./getBrowser.js";
import {
  saveToPdf,
  applyFiller,
  cvUrl,
  pdfPath,
  fillerId,
} from "./saveToPdf.js";

vi.mock("./getBrowser.js", () => ({
  getBrowser: vi.fn<typeof import("./getBrowser.js").getBrowser>(),
}));

/* withServer owns the spawn/kill lifecycle and is covered in server.test.ts;
   here it just runs the callback so the PDF logic can be asserted. */
vi.mock("./server.js", async (importOriginal: Function) => {
  const actual = await importOriginal();
  return {
    ...actual,
    withServer: vi
      .fn<typeof import("./server.js").withServer>()
      .mockImplementation((run) => run()),
  };
});

const mockPuppeteerPage = {
  goto: vi.fn<Page["goto"]>(),
  evaluate: vi.fn<Page["evaluate"]>(),
  pdf: vi.fn<Page["pdf"]>(),
};
const mockPuppeteerBrowser = {
  newPage: vi
    .fn<Browser["newPage"]>()
    .mockResolvedValue(mockPuppeteerPage as unknown as Page),
  close: vi.fn<Browser["close"]>(),
};

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

  it("calls getBrowser and creates a new page", async () => {
    await setup();

    expect(getBrowser).toHaveBeenCalledTimes(1);

    expect(mockPuppeteerBrowser.newPage).toHaveBeenCalledTimes(1);
  });

  it("navigates to the CV page on the running server", async () => {
    await setup();

    expect(mockPuppeteerPage.goto).toHaveBeenNthCalledWith(1, cvUrl, {
      waitUntil: "networkidle0",
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
