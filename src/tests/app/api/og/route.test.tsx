import { ImageResponse } from "next/og";

import { GET } from "@/app/api/og/route";

describe("dynamic Open Graph image", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns ImageResponse", async () => {
    expect((await GET()) instanceof ImageResponse).toBe(true);
  });
});
