import fs from "fs";

import type { Mock } from "vitest";

import { getBrowser } from "./getBrowser.js";
import { saveToPdf, cssPath, encoding } from "./saveToPdf.js";

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
  pdf: vi.fn(),
  setContent: vi.fn(),
};
const mockPuppeteerBrowser = {
  newPage: vi.fn().mockResolvedValue(mockPuppeteerPage),
  close: vi.fn(),
};

const mockFile = "Mock file";

const setup = async () => {
  (getBrowser as Mock).mockResolvedValue(mockPuppeteerBrowser);

  await saveToPdf();
};

describe("saveToPdf", () => {
  beforeEach(() => vi.clearAllMocks());

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

  it("saves a pdf of the new page", async () => {
    await setup();

    expect(mockPuppeteerPage.pdf).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ format: "A4" })
    );
  });

  it("closes the puppeteer browser", async () => {
    await setup();

    expect(mockPuppeteerBrowser.close).toHaveBeenCalledTimes(1);
  });
});
