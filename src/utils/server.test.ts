import { spawn } from "child_process";
import type { ChildProcess } from "child_process";

import type { Mock } from "vitest";

import {
  baseUrl,
  timeoutMessage,
  waitForServer,
  withServer,
} from "./server.js";

vi.mock("child_process", () => {
  const spawn = vi.fn<typeof import("child_process").spawn>();

  return { default: { spawn }, spawn };
});

const mockServer = { kill: vi.fn<ChildProcess["kill"]>() };

describe("waitForServer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves once the server responds", async () => {
    global.fetch = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
    } as Response);

    await expect(waitForServer()).resolves.toBeUndefined();

    expect(global.fetch).toHaveBeenNthCalledWith(1, baseUrl);
  });

  it("keeps polling while the server is not reachable", async () => {
    global.fetch = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error("ECONNREFUSED"))
      .mockResolvedValue({ ok: true } as Response);

    const pending = waitForServer();

    await vi.advanceTimersByTimeAsync(1000);
    await pending;

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("keeps polling while the server responds not ok", async () => {
    global.fetch = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockResolvedValue({ ok: true } as Response);

    const pending = waitForServer();

    await vi.advanceTimersByTimeAsync(1000);
    await pending;

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("throws once the timeout elapses", async () => {
    global.fetch = vi.fn<typeof fetch>().mockResolvedValue({
      ok: false,
    } as Response);

    const pending = waitForServer();
    /* oxlint-disable-next-line vitest/valid-expect -- awaited below, after the
       timers advance; awaiting here would hang before the timeout fires. */
    const assertion = expect(pending).rejects.toThrowError(timeoutMessage);

    await vi.advanceTimersByTimeAsync(61000);

    await assertion;
  });
});

describe("withServer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    (spawn as Mock).mockReturnValue(mockServer);
    global.fetch = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
    } as Response);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts a server, runs the callback, then kills it", async () => {
    const run = vi.fn<() => Promise<string>>().mockResolvedValue("done");

    const pending = withServer(run);

    await vi.runAllTimersAsync();

    await expect(pending).resolves.toBe("done");

    expect(spawn).toHaveBeenNthCalledWith(
      1,
      "npx",
      ["next", "start", "--port", "3000"],
      { stdio: "ignore" },
    );
    expect(run).toHaveBeenCalledTimes(1);
    expect(mockServer.kill).toHaveBeenCalledTimes(1);
  });

  it("kills the server when the callback throws", async () => {
    const run = vi
      .fn<() => Promise<never>>()
      .mockRejectedValue(new Error("no chrome"));

    const pending = withServer(run);
    /* oxlint-disable-next-line vitest/valid-expect -- awaited below, after the
       timers run; awaiting here would hang before the rejection surfaces. */
    const assertion = expect(pending).rejects.toThrowError("no chrome");

    await vi.runAllTimersAsync();
    await assertion;

    expect(mockServer.kill).toHaveBeenCalledTimes(1);
  });
});
