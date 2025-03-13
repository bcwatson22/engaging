import fs from "fs";
import puppeteer from "puppeteer";

import type { Mock } from "vitest";

import { saveToPdf, cssPath, htmlPath, encoding } from "./saveToPdf.mjs";

vi.mock("puppeteer", () => ({
  default: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        addStyleTag: vi.fn(),
        pdf: vi.fn(),
        setContent: vi.fn(),
      }),
      close: vi.fn(),
    }),
  },
}));

const spyReadFileSync = vi.spyOn(fs, "readFileSync");

const mockPuppeteerPage = {
  addStyleTag: vi.fn(),
  pdf: vi.fn(),
  setContent: vi.fn(),
};
const mockPuppeteerBrowser = {
  newPage: vi.fn().mockResolvedValue(mockPuppeteerPage),
  close: vi.fn(),
};

const setup = async () => {
  (puppeteer.launch as Mock).mockResolvedValue(mockPuppeteerBrowser);

  await saveToPdf();
};

describe("saveToPdf", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls readFileSync to get htmlContent", async () => {
    await setup();

    expect(spyReadFileSync).toHaveBeenNthCalledWith(1, htmlPath, encoding);
  });

  it("calls readdirSync to get CSS files", async () => {
    const spyReaddirSync = vi.spyOn(fs, "readdirSync");

    await setup();

    expect(spyReaddirSync).toHaveBeenNthCalledWith(1, cssPath);
  });

  it("calls readFileSync to get cssContent", async () => {
    await setup();

    expect(spyReadFileSync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining(cssPath),
      encoding
    );
  });

  it("launches a puppeteer browser and creates a new page", async () => {
    await setup();

    expect(puppeteer.launch).toHaveBeenNthCalledWith(1, {
      headless: true,
      args: ["--no-sandbox", "--disable-web-security"],
    });

    expect(mockPuppeteerBrowser.newPage).toHaveBeenCalledTimes(1);
  });

  it("injects the htmlContent to the new page", async () => {
    await setup();

    expect(mockPuppeteerPage.setContent).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("cv"),
      { waitUntil: ["networkidle0"] }
    );
  });

  it("adds page styles and fonts to the new page", async () => {
    await setup();

    expect(mockPuppeteerPage.addStyleTag).toHaveBeenNthCalledWith(1, {
      content: expect.stringContaining("flex"),
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
