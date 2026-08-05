import puppeteer, { type Browser } from "puppeteer";
import puppeteerCore, { type Browser as BrowserCore } from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

const headless = true;

const remoteExecutablePath =
  "https://github.com/Sparticuz/chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar";

type BrowserUnion = Browser | BrowserCore;

const getBrowser = async (): Promise<BrowserUnion> => {
  let browser: BrowserUnion;

  if (process.env.NODE_ENV === "production") {
    browser = await puppeteerCore.launch({
      headless,
      args: chromium.args,
      executablePath: await chromium.executablePath(remoteExecutablePath),
    });
  } else {
    browser = await puppeteer.launch({
      headless,
      args: ["--no-sandbox", "--disable-web-security"],
      ignoreDefaultArgs: ["--disable-extensions"],
    });
  }

  return browser;
};

export { getBrowser, headless, remoteExecutablePath };
export type { BrowserUnion };
