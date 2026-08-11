import { spawn } from "child_process";

const port = 3000;
const baseUrl = `http://127.0.0.1:${port}`;
const readyTimeout = 60000;
const pollInterval = 500;
const timeoutMessage = "Timed out waiting for the server to start";

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

/* Runs fn against a freshly started production server and always tears it
   down, including when the callback throws. The build runs the PDF and
   startup-image scripts in sequence, so each owns its own server rather than
   two competing for the same port. */
const withServer = async <T>(run: () => Promise<T>): Promise<T> => {
  const server = spawn("npx", ["next", "start", "--port", `${port}`], {
    stdio: "ignore",
  });

  try {
    await waitForServer();

    return await run();
  } finally {
    server.kill();
  }
};

export {
  withServer,
  waitForServer,
  wait,
  port,
  baseUrl,
  pollInterval,
  timeoutMessage,
};
