import { cleanup, render, screen } from "@testing-library/react";

import { Gig, GigSkeleton, type GigProps } from "./Gig";

import { Company } from "@/components/molecules/Company/Company";
import { Role } from "@/components/molecules/Role/Role";

import { mockCV } from "@/data/mock/cv";

vi.mock(
  import("@/components/molecules/Company/Company"),
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      Company: vi.fn(),
    };
  }
);

vi.mock(import("@/components/molecules/Role/Role"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Role: vi.fn(),
  };
});

const { company, logo, city, roles } = mockCV.gigs[0];

const defaultProps: GigProps = { company, logo, city, roles, delay: 0 };

const setup = (props?: Partial<GigProps>) =>
  render(<Gig {...defaultProps} {...props} />);

describe("Gig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders a section", () => {
    setup();

    expect(screen.getByRole("region")).toBeInTheDocument();
  });

  describe("company // logo // city", () => {
    it("renders a Company component", () => {
      setup();

      expect(Company).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ company, logo, city }),
        {}
      );
    });
  });

  describe("roles", () => {
    it("renders a Role component for each item", () => {
      setup();

      expect(Role).toHaveBeenCalledTimes(roles.length);
    });
  });
});

describe("GigSkeleton", () => {
  it("renders a skeleton state", () => {
    render(<GigSkeleton />);

    const numOfPulses = 12;

    expect(screen.getAllByRole("status", { name: "Loading..." })).toHaveLength(
      numOfPulses
    );
  });
});
