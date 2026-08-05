import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";

import { getBrowser, headless } from "./getBrowser.js";

vi.mock("puppeteer", () => ({
  default: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn(),
      close: vi.fn(),
    }),
  },
}));

vi.mock("puppeteer-core", () => ({
  default: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn(),
      close: vi.fn(),
    }),
  },
}));

vi.mock("@sparticuz/chromium-min", () => ({
  default: {
    args: {
      mockArgKey: "mockArgValue",
    },
    executablePath: vi.fn(),
  },
}));

describe("getBrowser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("creates a puppeteerCore instance in prod env", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await getBrowser();

    expect(puppeteerCore.launch).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        headless,
        args: { mockArgKey: "mockArgValue" },
      })
    );
  });

  it("creates a puppeteer instance in local env", async () => {
    await getBrowser();

    expect(puppeteer.launch).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        headless,
        args: ["--no-sandbox", "--disable-web-security"],
      })
    );
  });
});
