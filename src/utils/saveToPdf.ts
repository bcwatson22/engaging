import fs from "fs";

import type { Page } from "puppeteer";

import { getBrowser } from "./getBrowser.ts";

const cssPath = ".next/static/css/";
const encoding = "utf-8";
const margin = "5mm";
const pdfPath = "./public/billy-watson-cv.pdf";

const fillerId = "pdf-page-filler";

/* An A4 content box is ~1085px tall at 96dpi, so a filler this size always
   spills onto a new page — it seeds the upper bound of the search. */
const maxFill = 1200;

const pdfOptions = {
  format: "A4",
  margin: {
    top: margin,
    left: margin,
    right: margin,
    bottom: margin,
  },
} as const;

const getPageCount = (pdf: Uint8Array): number => {
  const match = Buffer.from(pdf)
    .toString("latin1")
    .match(/\/Type\s*\/Pages[\s\S]{0,200}?\/Count\s+(\d+)/);

  if (!match) {
    throw new Error("Could not read the page count from the generated PDF");
  }

  return Number(match[1]);
};

/* Serialised into the browser by page.evaluate, so it can only reach its own
   arguments — no module scope. */
const applyFiller = (id: string, height: number): void => {
  const filler = document.getElementById(id) ?? document.createElement("div");

  filler.id = id;
  filler.setAttribute("aria-hidden", "true");
  filler.style.height = `${height}px`;

  document.querySelector(".wrapper")?.append(filler);
};

const setFillerHeight = async (page: Page, height: number): Promise<void> => {
  await page.evaluate(applyFiller, fillerId, height);
};

const countPagesWithFill = async (
  page: Page,
  height: number,
): Promise<number> => {
  await setFillerHeight(page, height);

  return getPageCount(await page.pdf(pdfOptions));
};

/* The CV's border lives on a single .wrapper element, so Chrome closes it
   where the content ends rather than at the bottom of the last page. Growing
   the box by the largest amount that still fits the same number of pages
   lands its bottom edge flush with the final page break. The page height
   isn't knowable up front, so binary search the fill against real renders. */
const fillLastPage = async (page: Page): Promise<void> => {
  const pageCount = await countPagesWithFill(page, 0);

  if ((await countPagesWithFill(page, maxFill)) === pageCount) {
    throw new Error(`A ${maxFill}px filler did not spill onto a new page`);
  }

  let fits = 0;
  let spills = maxFill;

  while (spills - fits > 1) {
    const next = Math.floor((fits + spills) / 2);

    if ((await countPagesWithFill(page, next)) === pageCount) {
      fits = next;
    } else {
      spills = next;
    }
  }

  await setFillerHeight(page, fits);

  console.info(`Filled the last of ${pageCount} PDF pages with ${fits}px`);
};

const saveToPdf = async () => {
  const htmlContent = fs.readFileSync(".next/server/app/cv.html", encoding);

  /* Next only splits CSS into more than one chunk once a route needs it, but
     taking a single file would silently drop styles the day that happens. */
  const cssContent = fs
    .readdirSync(cssPath)
    .filter((filename) => filename.endsWith(".css"))
    .sort()
    .map((filename) => fs.readFileSync(cssPath + filename, encoding))
    .join("\n");

  const browser = await getBrowser();
  const page = (await browser.newPage()) as Page;

  await page.setContent(htmlContent, {
    waitUntil: ["networkidle0"],
  });
  await page.addStyleTag({ content: cssContent });
  await page.addStyleTag({
    content:
      "@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400..700&display=swap');",
  });

  try {
    await fillLastPage(page);
  } catch (error) {
    /* Cosmetic only — a short border beats a failed build. */
    console.warn("Could not fill the last PDF page:", error);
  }

  await page.pdf({ ...pdfOptions, path: pdfPath });

  await browser.close();
};

export {
  saveToPdf,
  applyFiller,
  cssPath,
  encoding,
  pdfPath,
  fillerId,
  maxFill,
};
