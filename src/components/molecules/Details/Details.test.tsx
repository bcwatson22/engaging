import { cleanup, render, screen } from "@testing-library/react";

import { Details, DetailsSkeleton, type DetailsProps } from "./Details";

import { Address } from "@/components/atoms/Address/Address";
import { Link } from "@/components/atoms/Link/Link";

import { mockCV } from "@/data/mock/cv";

vi.mock("@/components/atoms/Address/Address", () => ({
  Address: vi.fn(),
}));

vi.mock(import("@/components/atoms/Link/Link"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Link: vi.fn(),
  };
});

const { address, contactLinks: links } = mockCV;

const defaultProps: DetailsProps = {
  address,
  links,
};

const setup = (props?: Partial<DetailsProps>) =>
  render(<Details {...defaultProps} {...props} />);

describe("Details", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe("address", () => {
    it("renders an Address component if defined", () => {
      setup();

      expect(Address).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ address }),
        {}
      );
    });

    it("doesn't render an Address component if undefined", () => {
      setup({
        address: undefined,
      });

      expect(Address).not.toHaveBeenCalled();
    });
  });

  describe("links", () => {
    it("renders a listitem and Link component for each item", () => {
      setup();

      const numberOfLinks = links.length;

      expect(screen.getAllByRole("listitem")).toHaveLength(numberOfLinks);
      expect(Link).toHaveBeenCalledTimes(numberOfLinks);
    });
  });
});

describe("DetailsSkeleton", () => {
  it("renders a skeleton state", () => {
    render(<DetailsSkeleton />);

    const numOfPulses = 4;

    expect(screen.getAllByRole("status", { name: "Loading..." })).toHaveLength(
      numOfPulses
    );
  });
});
