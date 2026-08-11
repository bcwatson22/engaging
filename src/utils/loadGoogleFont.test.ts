import { loadGoogleFont, errorMessage } from "./loadGoogleFont";

describe("loadGoogleFont", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns ArrayBuffer if the fetch was successful", async () => {
    expect((await loadGoogleFont()) instanceof ArrayBuffer).toBe(true);
  });

  it("throws an error if the font resource responds with a non-200", async () => {
    global.fetch = vi.fn<typeof fetch>((url) =>
      Promise.resolve(
        typeof url === "string" && url.includes("fonts.googleapis.com")
          ? ({
              text: async () =>
                "src: url(https://fonts.gstatic.com/font.ttf) format('truetype')",
            } as Response)
          : ({ status: 404 } as Response),
      ),
    );

    await expect(async () => await loadGoogleFont()).rejects.toThrowError(
      errorMessage,
    );
  });

  it("throws an error if something went wrong with the fetch", async () => {
    global.fetch = vi.fn<typeof fetch>(() =>
      Promise.resolve({
        text: async () => "string not containing font data",
      } as Response),
    );

    await expect(async () => await loadGoogleFont()).rejects.toThrowError(
      errorMessage,
    );
  });
});
