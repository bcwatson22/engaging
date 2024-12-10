import { vi, expect, describe, it, beforeEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { Logo, type TLogo, alt } from "./Logo";
import { mockCV } from "@/data/mock/cv";

const { logoLightBackground, logoDarkBackground } = mockCV;

const defaultProps: TLogo = {
  logoLightBackground,
  logoDarkBackground,
};

const setup = (props?: Partial<TLogo>) =>
  render(<Logo {...defaultProps} {...props} />);

describe("Logo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders an image for screen", () => {
    setup();

    expect(screen.getByRole("img", { name: alt })).toBeInTheDocument();
  });

  it("renders an image for print", () => {
    setup();

    expect(screen.getByRole("figure", { name: alt })).toHaveAttribute(
      "style",
      expect.stringContaining(logoLightBackground.url)
    );
  });
});
