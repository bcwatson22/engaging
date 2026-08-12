import { ImageResponse } from "next/og";
import type { Mock } from "vitest";

import { GET, getImageProps } from "@/app/api/og/route";
import { getData } from "@/data/functions/getData";
import { mockHome } from "@/data/mock/home";

vi.mock("@/data/functions/getData", () => ({
  getData: vi.fn<typeof import("@/data/functions/getData").getData>(),
}));

const webpUrl = "https://example.com/asset/output=format:webp/id";

/* mockHome's fixture URLs carry no format segment, so the webp → png rewrite
   is given URLs that actually exercise it. */
const setup = () => {
  (getData as Mock).mockResolvedValue({
    ...mockHome,
    mugshot: { ...mockHome.mugshot, image: { url: webpUrl } },
    technologies: mockHome.technologies.map((item) => ({
      ...item,
      icon: { ...item.icon, url: webpUrl },
    })),
  });
};

describe("dynamic Open Graph image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setup();
  });

  it("returns ImageResponse", async () => {
    expect((await GET()) instanceof ImageResponse).toBe(true);
  });

  /* Satori cannot decode webp, so every asset URL has to reach it as png. */
  it("rewrites asset URLs from webp to png", async () => {
    const { mugshot, technologies } = await getImageProps();

    const expected = webpUrl.replace("webp", "png");

    expect(mugshot.image.url).toBe(expected);
    technologies.forEach(({ icon }) => {
      expect(icon.url).toBe(expected);
    });
  });
});
