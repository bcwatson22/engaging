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

    it("renders multiple spans if value contains '//'", () => {
      const { name } = mockHome.technologies[2];
      const split = name.split(" // ");

      setup({ name });

      expect(screen.getByText(`${split[0]} //`)).toBeInTheDocument();
      expect(screen.getByText(split[1])).toBeInTheDocument();
    });

    it("adds 'white' class if value is Next", () => {
      setup();

      expect(screen.getByRole("img", { name: `${name} logo` })).toHaveClass(
        "white"
      );
    });

    it("doesn't add 'white' class if value is not Next", () => {
      const { name } = mockHome.technologies[1];

      setup({
        name,
      });

      expect(screen.getByRole("img", { name: `${name} logo` })).not.toHaveClass(
        "white"
      );
    });
  });
});

describe("TechnologySkeleton", () => {
  it("renders a skeleton state", () => {
    render(<TechnologySkeleton />);

    const numOfPulses = 1;

    expect(screen.getAllByRole("status", { name: "Loading..." })).toHaveLength(
      numOfPulses
    );
  });
});
