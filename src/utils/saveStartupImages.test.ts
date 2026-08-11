import { spawn } from "child_process";

import type { Mock } from "vitest";

import { startupDevices } from "../constants/startupImages.js";
import { getBrowser } from "./getBrowser.js";
import {
  saveStartupImages,
  captureStartupImages,
  waitForServer,
  pages,
  baseUrl,
  timeoutMessage,
} from "./saveStartupImages.js";

vi.mock("child_process", () => {
  const spawn = vi.fn();

  return { default: { spawn }, spawn };
});

vi.mock("./getBrowser.js", () => ({
  getBrowser: vi.fn(),
}));

const mockPage = {
  setViewport: vi.fn(),
  goto: vi.fn(),
  screenshot: vi.fn(),
};

const mockBrowser = {
  newPage: vi.fn().mockResolvedValue(mockPage),
  close: vi.fn(),
};

const mockServer = { kill: vi.fn() };

const totalCaptures = pages.length * startupDevices.length;

const setup = () => {
  (spawn as Mock).mockReturnValue(mockServer);
  (getBrowser as Mock).mockResolvedValue(mockBrowser);
  mockBrowser.newPage.mockResolvedValue(mockPage);

  return saveStartupImages();
};

describe("waitForServer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves once the server responds", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);

    await expect(waitForServer()).resolves.toBeUndefined();

    expect(global.fetch).toHaveBeenNthCalledWith(1, baseUrl);
  });

  it("keeps polling while the server is not reachable", async () => {
    global.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("ECONNREFUSED"))
      .mockResolvedValue({ ok: true } as Response);

    const pending = waitForServer();

    await vi.advanceTimersByTimeAsync(1000);
    await pending;

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("keeps polling while the server responds not ok", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockResolvedValue({ ok: true } as Response);

    const pending = waitForServer();

    await vi.advanceTimersByTimeAsync(1000);
    await pending;

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("throws once the timeout elapses", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false } as Response);

    const pending = waitForServer();
    const assertion = expect(pending).rejects.toThrowError(timeoutMessage);

    await vi.advanceTimersByTimeAsync(61000);

    await assertion;
  });
});

describe("captureStartupImages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockBrowser.newPage.mockResolvedValue(mockPage);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("captures one screenshot per page per device", async () => {
    const pending = captureStartupImages(mockBrowser as never);

    await vi.runAllTimersAsync();
    await pending;

    expect(mockPage.screenshot).toHaveBeenCalledTimes(totalCaptures);
    expect(mockPage.setViewport).toHaveBeenCalledTimes(totalCaptures);
  });

  it("sets the viewport from the device dimensions", async () => {
    const pending = captureStartupImages(mockBrowser as never);

    await vi.runAllTimersAsync();
    await pending;

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
    const pending = captureStartupImages(mockBrowser as never);

    await vi.runAllTimersAsync();
    await pending;

    expect(mockPage.goto).toHaveBeenNthCalledWith(1, `${baseUrl}/`, {
      waitUntil: "load",
    });
  });

  it("names each screenshot after the page and its pixel dimensions", async () => {
    const pending = captureStartupImages(mockBrowser as never);

    await vi.runAllTimersAsync();
    await pending;

    expect(mockPage.screenshot).toHaveBeenNthCalledWith(1, {
      path: "./public/startup-home-1320x2868.png",
      type: "png",
    });
  });
});

describe("saveStartupImages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts a server, captures the images, then cleans up", async () => {
    const pending = setup();

    await vi.runAllTimersAsync();
    await pending;

    expect(spawn).toHaveBeenNthCalledWith(
      1,
      "npx",
      ["next", "start", "--port", "3000"],
      { stdio: "ignore" },
    );
    expect(mockPage.screenshot).toHaveBeenCalledTimes(totalCaptures);
    expect(mockBrowser.close).toHaveBeenCalledTimes(1);
    expect(mockServer.kill).toHaveBeenCalledTimes(1);
  });

  it("kills the server even if the browser never launched", async () => {
    (spawn as Mock).mockReturnValue(mockServer);
    (getBrowser as Mock).mockRejectedValue(new Error("no chrome"));

    const pending = saveStartupImages();
    const assertion = expect(pending).rejects.toThrowError("no chrome");

    await vi.runAllTimersAsync();
    await assertion;

    expect(mockBrowser.close).not.toHaveBeenCalled();
    expect(mockServer.kill).toHaveBeenCalledTimes(1);
  });
});
