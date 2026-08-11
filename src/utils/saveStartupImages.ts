import {
  startupDevices,
  getStartupImageName,
} from "../constants/startupImages.ts";
import { getBrowser, type BrowserUnion } from "./getBrowser.ts";
import { baseUrl, wait, withServer } from "./server.ts";

const settleDelay = 2000;

const pages = [
  { name: "home", path: "/" },
  { name: "cv", path: "/cv" },
];

const captureStartupImages = async (browser: BrowserUnion): Promise<void> => {
  const page = await browser.newPage();

  for (const { name, path } of pages) {
    for (const device of startupDevices) {
      const { width, height, ratio } = device;

      await page.setViewport({
        width,
        height,
        deviceScaleFactor: ratio,
        isMobile: true,
        hasTouch: true,
      });

      await page.goto(`${baseUrl}${path}`, { waitUntil: "load" });

      // let the particles canvas mount and entry animations settle
      await wait(settleDelay);

      await page.screenshot({
        path: `./public/startup-${name}-${getStartupImageName(device)}.png`,
        type: "png",
      });
    }
  }
};

const saveStartupImages = async (): Promise<void> =>
  await withServer(async () => {
    const browser = await getBrowser();

    try {
      await captureStartupImages(browser);
    } finally {
      await browser.close();
    }
  });

export { saveStartupImages, captureStartupImages, pages, settleDelay };
