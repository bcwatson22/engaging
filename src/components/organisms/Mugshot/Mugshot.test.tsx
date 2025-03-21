import { cleanup, render, screen } from "@testing-library/react";

import { Mugshot, MugshotSkeleton, type MugshotProps } from "./Mugshot";

import { Details } from "@/components/molecules/Details/Details";
import { Technology } from "@/components/molecules/Technology/Technology";

import { mockHome } from "@/data/mock/home";

vi.mock(
  import("@/components/molecules/Details/Details"),
  async (importOriginal: Function) => {
    const actual = await importOriginal();
    return {
      ...actual,
      Details: vi.fn(),
    };
  }
);

vi.mock(
  import("@/components/molecules/Technology/Technology"),
  async (importOriginal: Function) => {
    const actual = await importOriginal();
    return {
      ...actual,
      Technology: vi.fn(),
    };
  }
);

const { mugshot, technologies } = mockHome;
const { heading, description, links, image } = mugshot;

const defaultProps: MugshotProps = { mugshot, technologies };

const setup = (props?: Partial<MugshotProps>) =>
  render(<Mugshot {...defaultProps} {...props} />);

describe("Mugshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders a section", () => {
    setup();

    expect(screen.getByRole("region", { name: heading })).toBeInTheDocument();
  });

  describe("mugshot", () => {
    describe("image", () => {
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

    describe("heading", () => {
      it("renders a heading", () => {
        setup();

        expect(
          screen.getByRole("heading", { level: 2, name: heading })
        ).toBeInTheDocument();
      });
    });

    describe("description", () => {
      it("renders a paragraph", () => {
        setup();

        expect(screen.getByText(description)).toBeInTheDocument();
      });
    });

    describe("links", () => {
      it("renders a Details component", () => {
        setup();

        expect(Details).toHaveBeenNthCalledWith(1, { links }, {});
      });
    });
  });

  describe("technologies", () => {
    it("renders a Technology component for each item", () => {
      setup();

      expect(Technology).toHaveBeenCalledTimes(technologies.length);
    });
  });
});

describe("MugshotSkeleton", () => {
  it("renders a skeleton state", () => {
    render(<MugshotSkeleton />);

    const numOfPulses = 13;

    expect(screen.getAllByRole("status", { name: "Loading..." })).toHaveLength(
      numOfPulses
    );
  });
});
