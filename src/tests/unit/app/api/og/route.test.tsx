import { cleanup, render, screen } from "@testing-library/react";

import { GET, ImageMarkup } from "@/app/api/og/route";
import { mockHome } from "@/data/mock/home";

const {
  title,
  mugshot: { heading },
  technologies,
} = mockHome;

describe("CVPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("defines image markup", () => {
    render(<ImageMarkup />);

    expect(screen.getByRole("article")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: `Portrait of ${heading}` })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: title })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(technologies.length);

    for (const {
      name,
      icon: { url },
    } of technologies)
      expect(screen.getByRole("img", { name })).toHaveAttribute("src", url);
  });

  it("returns dynamic ImageResponse", async () => {
    const result = await GET();

    expect(result).not.toBe(null);
  });
});
