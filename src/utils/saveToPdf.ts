import fs from "fs";
import puppeteer, { type Browser } from "puppeteer";
import puppeteerCore, { type Browser as BrowserCore } from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

const cssPath = ".next/static/css/";
const htmlPath = ".next/server/app/cv.html";
const encoding = "utf-8";

const remoteExecutablePath =
  "https://github.com/Sparticuz/chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar";

let browser: Browser | BrowserCore;

const getBrowser = async () => {
  if (browser) return browser;

  if (process.env.NODE_ENV === "production") {
    browser = await puppeteerCore.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(remoteExecutablePath),
      headless: true,
    });
  } else {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-web-security"],
      ignoreDefaultArgs: ["--disable-extensions"],
    });
  }

  return browser;
};

const saveToPdf = async () => {
  const htmlContent = fs.readFileSync(htmlPath, encoding);

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
      top: "5mm",
      left: "5mm",
      right: "5mm",
      bottom: "5mm",
    },
  });

  await browser.close();
};

(async () => saveToPdf())();

export { cssPath, htmlPath, encoding, saveToPdf };
