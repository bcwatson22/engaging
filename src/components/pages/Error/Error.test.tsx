import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Error, type ErrorProps } from "./Error";

import { Inner } from "@/components/atoms/Link/Link";
import { Particles } from "@/components/atoms/Particles/Particles";
import { TechnologySkeleton } from "@/components/molecules/Technology/Technology";

import { mockHome } from "@/data/mock/home";

vi.mock(import("@/components/atoms/Link/Link"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Inner: vi.fn(),
  };
});

vi.mock("@/components/atoms/Particles/Particles", () => ({
  Particles: vi.fn(),
}));

vi.mock(
  import("@/components/molecules/Technology/Technology"),
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      TechnologySkeleton: vi.fn(),
    };
  }
);

const mockHeading = "mockHeading";
const mockText = "mockText";
const mockChildren = <a href="/mock-location">{mockText}</a>;
const mockContent = mockHome.mugshot;
const mockReset = vi.fn();

const { image, heading } = mockContent;

const defaultProps: ErrorProps = {
  heading: mockHeading,
  children: mockChildren,
  content: mockContent,
  reset: mockReset,
};

const setup = (props?: Partial<ErrorProps>) =>
  render(<Error {...defaultProps} {...props} />);

describe("Error", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders a main", () => {
    setup();

    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders a heading", () => {
    setup();

    expect(
      screen.getByRole("heading", { level: 1, name: "Engaging Engineering" })
    ).toBeInTheDocument();
  });

  it("renders a section", () => {
    setup();

    expect(
      screen.getByRole("region", { name: mockHeading })
    ).toBeInTheDocument();
  });

  describe("heading", () => {
    it("renders a heading if defined", () => {
      setup();

      expect(
        screen.getByRole("heading", { level: 2, name: mockHeading })
      ).toBeInTheDocument();
    });

    it("renders fallback if undefined", () => {
      setup({
        heading: undefined,
      });

      expect(
        screen.getByRole("heading", { level: 2, name: "Oops" })
      ).toBeInTheDocument();
    });
  });

  describe("children", () => {
    it("renders children if defined ", () => {
      setup();

      expect(screen.getByRole("link", { name: mockText })).toBeInTheDocument();
    });

    it("renders fallback if undefined", () => {
      setup({
        children: undefined,
      });

      expect(
        screen.getByText(
          "Something went wrong, but believe it or not you're not actually reading this, so it's all ok."
        )
      ).toBeInTheDocument();
    });
  });

  describe("content", () => {
    describe("image // name", () => {
      it("renders an image", () => {
        setup();

        expect(
          screen.getByRole("img", { name: `Portrait of ${heading}` })
        ).toHaveAttribute(
          "src",
          expect.stringContaining(encodeURIComponent(image.url))
        );
      });
    });
  });

  describe("reset", () => {
    it("renders a button if defined", () => {
      setup();

      expect(Inner).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ text: "Try again" }),
        {}
      );
    });

    it("is called when the button is clicked", async () => {
      setup();

      await userEvent.click(screen.getByRole("button"));

      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it("doesn't render a button if undefined", () => {
      setup({ reset: undefined });

      expect(Inner).not.toHaveBeenCalled();
    });
  });

  it("renders TechnologySkeleton components", () => {
    setup();

    const numberOfTechnologies = 12;

    expect(TechnologySkeleton).toHaveBeenCalledTimes(numberOfTechnologies);
  });

  it("renders a Particles component", () => {
    setup();

    expect(Particles).toHaveBeenCalledTimes(1);
  });
});
