import { spawn } from "child_process";

import { getBrowser, type BrowserUnion } from "./getBrowser.ts";
import {
  startupDevices,
  getStartupImageName,
} from "../constants/startupImages.ts";

const port = 3000;
const baseUrl = `http://127.0.0.1:${port}`;
const readyTimeout = 60000;
const pollInterval = 500;
const settleDelay = 2000;
const timeoutMessage = "Timed out waiting for the server to start";

const pages = [
  { name: "home", path: "/" },
  { name: "cv", path: "/cv" },
];

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const waitForServer = async (): Promise<void> => {
  const deadline = Date.now() + readyTimeout;

  while (Date.now() < deadline) {
    try {
      const { ok } = await fetch(baseUrl);

      if (ok) return;
    } catch {
      // server hasn't bound to the port yet
    }

    await wait(pollInterval);
  }

  throw new Error(timeoutMessage);
};

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

const saveStartupImages = async (): Promise<void> => {
  const server = spawn("npx", ["next", "start", "--port", `${port}`], {
    stdio: "ignore",
  });

  let browser: BrowserUnion | undefined;

  try {
    await waitForServer();

    browser = await getBrowser();

    await captureStartupImages(browser);
  } finally {
    await browser?.close();

    server.kill();
  }
};

(async () => saveStartupImages())();

export {
  saveStartupImages,
  captureStartupImages,
  waitForServer,
  pages,
  port,
  baseUrl,
  timeoutMessage,
  pollInterval,
  settleDelay,
};
