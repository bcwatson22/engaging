import { loadGoogleFont, errorMessage } from "./loadGoogleFont";

describe("dynamic Open Graph image", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns ArrayBuffer if the fetch was successful", async () => {
    expect((await loadGoogleFont()) instanceof ArrayBuffer).toBe(true);
  });

  it("throws an error if something went wrong with the fetch", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        text: async () => "string not containing font data",
      } as Response)
    );

    await expect(async () => await loadGoogleFont()).rejects.toThrowError(
      errorMessage
    );
  });
});
