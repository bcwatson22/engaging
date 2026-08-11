import type { Page } from "puppeteer";

import { getBrowser } from "./getBrowser.ts";
import { baseUrl, withServer } from "./server.ts";

const cvUrl = `${baseUrl}/cv`;
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

const saveToPdf = async () =>
  await withServer(async () => {
    const browser = await getBrowser();
    const page = (await browser.newPage()) as Page;

    try {
      await page.goto(cvUrl, { waitUntil: "networkidle0" });

      try {
        await fillLastPage(page);
      } catch (error) {
        /* Cosmetic only — a short border beats a failed build. */
        console.warn("Could not fill the last PDF page:", error);
      }

      await page.pdf({ ...pdfOptions, path: pdfPath });
    } finally {
      await browser.close();
    }
  });

export { saveToPdf, applyFiller, cvUrl, pdfPath, fillerId, maxFill };
