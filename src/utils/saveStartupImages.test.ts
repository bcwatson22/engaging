import type { Browser, Page } from "puppeteer";
import type { Mock } from "vitest";

import { startupDevices } from "../constants/startupImages.js";
import { getBrowser } from "./getBrowser.js";
import {
  saveStartupImages,
  captureStartupImages,
  pages,
} from "./saveStartupImages.js";
import { baseUrl, withServer } from "./server.js";

vi.mock("./getBrowser.js", () => ({
  getBrowser: vi.fn<typeof import("./getBrowser.js").getBrowser>(),
}));

/* withServer owns the spawn/kill lifecycle and is covered in server.test.ts;
   here it just runs the callback so the capture logic can be asserted. */
vi.mock("./server.js", async (importOriginal: Function) => {
  const actual = await importOriginal();
  return {
    ...actual,
    withServer: vi
      .fn<typeof import("./server.js").withServer>()
      .mockImplementation((run) => run()),
    wait: vi.fn<typeof import("./server.js").wait>().mockResolvedValue(),
  };
});

const mockPage = {
  setViewport: vi.fn<Page["setViewport"]>(),
  goto: vi.fn<Page["goto"]>(),
  screenshot: vi.fn<Page["screenshot"]>(),
};

const mockBrowser = {
  newPage: vi
    .fn<Browser["newPage"]>()
    .mockResolvedValue(mockPage as unknown as Page),
  close: vi.fn<Browser["close"]>(),
};

const totalCaptures = pages.length * startupDevices.length;

describe("captureStartupImages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBrowser.newPage.mockResolvedValue(mockPage as unknown as Page);
  });

  it("captures one screenshot per page per device", async () => {
    await captureStartupImages(mockBrowser as never);

    expect(mockPage.screenshot).toHaveBeenCalledTimes(totalCaptures);
    expect(mockPage.setViewport).toHaveBeenCalledTimes(totalCaptures);
  });

  it("sets the viewport from the device dimensions", async () => {
    await captureStartupImages(mockBrowser as never);

    const [{ width, height, ratio }] = startupDevices;

    expect(mockPage.setViewport).toHaveBeenNthCalledWith(1, {
      width,
      height,
      deviceScaleFactor: ratio,
      isMobile: true,
      hasTouch: true,
    });
  });

  it("waits for load on each page", async () => {
    await captureStartupImages(mockBrowser as never);

    expect(mockPage.goto).toHaveBeenNthCalledWith(1, `${baseUrl}/`, {
      waitUntil: "load",
    });
  });

  it("names each screenshot after the page and its pixel dimensions", async () => {
    await captureStartupImages(mockBrowser as never);

    expect(mockPage.screenshot).toHaveBeenNthCalledWith(1, {
      path: "./public/startup-home-1320x2868.png",
      type: "png",
    });
  });
});

describe("saveStartupImages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBrowser.newPage.mockResolvedValue(mockPage as unknown as Page);
    (getBrowser as Mock).mockResolvedValue(mockBrowser);
  });

  it("captures the images inside a running server, then closes the browser", async () => {
    await saveStartupImages();

    expect(withServer).toHaveBeenCalledTimes(1);
    expect(mockPage.screenshot).toHaveBeenCalledTimes(totalCaptures);
    expect(mockBrowser.close).toHaveBeenCalledTimes(1);
  });

  it("closes the browser even if capturing throws", async () => {
    mockBrowser.newPage.mockRejectedValue(new Error("no page"));

    await expect(saveStartupImages()).rejects.toThrowError("no page");

    expect(mockBrowser.close).toHaveBeenCalledTimes(1);
  });
});
