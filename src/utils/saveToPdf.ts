import fs from "fs";
import puppeteer, { type Browser } from "puppeteer";
import puppeteerCore, { type Browser as BrowserCore } from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

const headless = true;
const cssPath = ".next/static/css/";
const encoding = "utf-8";
const margin = "5mm";

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

const saveToPdf = async () => {
  const htmlContent = fs.readFileSync(".next/server/app/cv.html", encoding);

  const cssFiles = fs
    .readdirSync(cssPath)
    .filter((filename) => filename.endsWith(".css"));
  const cssContent = fs.readFileSync(cssPath + cssFiles[0], encoding);

  const browser = await getBrowser();
  const page = await browser.newPage();

  await page.setContent(htmlContent, {
    waitUntil: ["networkidle0"],
  });
  await page.addStyleTag({ content: cssContent });
  await page.addStyleTag({
    content:
      "@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400..700&display=swap');",
  });

  await page.pdf({
    path: "./public/billy-watson-cv.pdf",
    format: "A4",
    margin: {
      top: margin,
      left: margin,
      right: margin,
      bottom: margin,
    },
  });

  await browser.close();
};

(async () => saveToPdf())();

export { getBrowser, saveToPdf, headless, cssPath, encoding };
