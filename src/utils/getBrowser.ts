import chromium from "@sparticuz/chromium-min";
import puppeteer, { type Browser } from "puppeteer";
import puppeteerCore, { type Browser as BrowserCore } from "puppeteer-core";

const headless = true;

/* From v149 the release packs are split by architecture — there is no longer
   a single chromium-vNNN-pack.tar. Vercel's Node runtime is x64. */
const remoteExecutablePath =
  "https://github.com/Sparticuz/chromium/releases/download/v149.0.0/chromium-v149.0.0-pack.x64.tar";

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
