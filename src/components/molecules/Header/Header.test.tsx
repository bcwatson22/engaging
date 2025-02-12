import { cleanup, render, screen } from "@testing-library/react";

import { Header, HeaderSkeleton, type HeaderProps } from "./Header";

import { Intro } from "@/components/atoms/Intro/Intro";
import { Logo } from "@/components/atoms/Logo/Logo";

import { mockCV } from "@/data/mock/cv";

vi.mock("@/components/atoms/Intro/Intro", () => ({
  Intro: vi.fn(),
}));

vi.mock("@/components/atoms/Logo/Logo", () => ({
  Logo: vi.fn(),
}));

const {
  meta: { title },
  logoDarkBackground,
  logoLightBackground,
  intro,
} = mockCV;

const defaultProps: HeaderProps = {
  title,
  logoDarkBackground,
  logoLightBackground,
  intro,
};

const setup = (props?: Partial<HeaderProps>) =>
  render(<Header {...defaultProps} {...props} />);

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe("title", () => {
    it("renders a heading", () => {
      setup();

      expect(
        screen.getByRole("heading", { level: 1, name: title })
      ).toBeInTheDocument();
    });
  });

  describe("logoDarkBackground // logoLightBackground", () => {
    it("renders a Logo", () => {
      setup();

      expect(Logo).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ logoDarkBackground, logoLightBackground }),
        {}
      );
    });
  });

  describe("intro", () => {
    it("renders an Intro", () => {
      setup();

      expect(Intro).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ intro }),
        {}
      );
    });
  });
});

describe("HeaderSkeleton", () => {
  it("renders a skeleton state", () => {
    render(<HeaderSkeleton />);

    const numOfPulses = 4;

    expect(screen.getAllByRole("status", { name: "Loading..." })).toHaveLength(
      numOfPulses
    );
  });
});
