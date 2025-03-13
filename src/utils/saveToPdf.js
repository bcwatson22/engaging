const fs = require("fs");
const puppeteer = require("puppeteer");

(async () => {
  const htmlContent = fs.readFileSync(".next/server/app/cv.html", "utf8");

  const cssPath = ".next/static/css/";
  const cssFiles = fs
    .readdirSync(cssPath)
    .filter((filename) => filename.endsWith(".css"));
  const cssContent = fs.readFileSync(cssPath + cssFiles[0], "utf8");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-web-security"],
  });
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
})();
