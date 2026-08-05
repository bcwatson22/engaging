import fs from "fs";

import { getBrowser } from "./getBrowser.ts";

const cssPath = ".next/static/css/";
const encoding = "utf-8";
const margin = "5mm";

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

export { saveToPdf, cssPath, encoding };
