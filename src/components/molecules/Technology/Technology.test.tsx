import { cleanup, render, screen } from "@testing-library/react";

import {
  Technology,
  TechnologySkeleton,
  type TechnologyProps,
} from "./Technology";

import { mockHome } from "@/data/mock/home";

const { name, icon } = mockHome.technologies[0];

const defaultProps: TechnologyProps = {
  name,
  icon,
};

const setup = (props?: Partial<TechnologyProps>) =>
  render(<Technology {...defaultProps} {...props} />);

describe("Technology", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe("icon", () => {
    it("renders an image if defined", () => {
      setup();

      expect(screen.getByRole("img", { name: `${name} logo` })).toHaveAttribute(
        "src",
        expect.stringContaining(encodeURIComponent(icon.url))
      );
    });

    it("doesn't render an image if undefined", () => {
      setup({
        icon: undefined,
      });

      expect(
        screen.queryByRole("img", { name: `${name} logo` })
      ).not.toBeInTheDocument();
    });
  });

  describe("name", () => {
    it("renders a span", () => {
      setup();

      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });
});

describe("TechnologySkeleton", () => {
  it("renders a skeleton state", () => {
    render(<TechnologySkeleton />);

    const numberOfPulses = 1;

    expect(screen.getAllByRole("status", { name: "Loading..." })).toHaveLength(
      numberOfPulses
    );
  });
});
