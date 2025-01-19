import { GET } from "@/app/api/og/route";

describe("dynamic opengraph image", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns ImageResponse", async () => {
    const result = await GET();

    expect(result).not.toBe(null);
  });
});
