import { GET, loadGoogleFont, errorMessage } from "@/app/api/og/route";

describe("dynamic Open Graph image", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns ImageResponse if the fetch was successful", async () => {
    expect(await GET()).not.toBe(null);
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
