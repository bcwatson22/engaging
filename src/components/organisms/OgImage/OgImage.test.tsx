import { cleanup, render, screen } from "@testing-library/react";

import { OgImage, type OgImageProps } from "./OgImage";

import { mockHome } from "@/data/mock/home";

const {
  meta: { title },
  mugshot: { heading },
  technologies,
} = mockHome;

const setup = (props?: Partial<OgImageProps>) =>
  render(<OgImage {...mockHome} {...props} />);

describe("OgImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders image markup", () => {
    setup();

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
});
