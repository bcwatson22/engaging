import sitemap, { changeFrequency } from "@/app/sitemap";

describe("sitemap", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a sitemap", () => {
    const result = sitemap();

    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining({ changeFrequency })])
    );
  });
});
