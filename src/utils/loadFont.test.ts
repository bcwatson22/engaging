import { readFile } from "fs/promises";

import { errorMessage, fontPath, loadFont } from "./loadFont";

/* Built inside the factory because vi.mock is hoisted above any const here.
   Both shapes, since the module is consumed as a named import in this file
   and as a default elsewhere in the codebase. */
vi.mock("fs/promises", () => {
  const readFile = vi.fn<() => Promise<Buffer>>();

  return { readFile, default: { readFile } };
});

const setup = (options: { fails?: boolean } = {}) => {
  const data = Buffer.from("font-data");

  if (options.fails) {
    vi.mocked(readFile).mockRejectedValue(new Error("ENOENT"));
  } else {
    vi.mocked(readFile).mockResolvedValue(data);
  }

  return { data };
};

describe("loadFont", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the font data", async () => {
    const { data } = setup();

    await expect(loadFont()).resolves.toBe(data);
  });

  it("reads the file bundled with the deployment", async () => {
    setup();

    await loadFont();

    expect(readFile).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(fontPath),
    );
  });

  /* Almost certainly means the font was left out of the serverless bundle,
     which passes locally and fails only once deployed — so the message needs
     to carry the underlying cause. */
  it("explains itself when the file is not there", async () => {
    setup({ fails: true });

    await expect(loadFont()).rejects.toThrow(errorMessage);
  });

  it("keeps the original error in the message", async () => {
    setup({ fails: true });

    await expect(loadFont()).rejects.toThrow(/ENOENT/);
  });
});
