import manifest from "@/app/manifest";

describe("manifest", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a manifest", () => {
    const result = manifest();

    expect(result).toEqual(
      expect.objectContaining({ start_url: "/", display: "standalone" })
    );
  });
});
