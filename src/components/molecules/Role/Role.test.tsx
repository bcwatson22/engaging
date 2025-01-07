import { cleanup, render, screen } from "@testing-library/react";

import { Role, RoleSkeleton, type RoleProps } from "./Role";

import { Bullet } from "@/components/atoms/Bullet/Bullet";
import { Dates } from "@/components/atoms/Dates/Dates";

import { mockCV } from "@/data/mock/cv";

vi.mock(import("@/components/atoms/Bullet/Bullet"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Bullet: vi.fn(),
  };
});

vi.mock("@/components/atoms/Dates/Dates", () => ({
  Dates: vi.fn(),
}));

const { role, dates, capacity, bullets } = mockCV.gigs[0].roles[0];

const defaultProps: RoleProps = {
  role,
  dates,
  capacity,
  bullets,
  index: 0,
  total: 1,
};

const setup = (props?: Partial<RoleProps>) =>
  render(<Role {...defaultProps} {...props} />);

describe("Role", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe("role", () => {
    it("renders a heading", () => {
      setup();

      expect(
        screen.getByRole("heading", { level: 4, name: role })
      ).toBeInTheDocument();
    });
  });

  describe("dates", () => {
    it("renders a Dates component", () => {
      setup();

      expect(Dates).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ dates }),
        {}
      );
    });
  });

  describe("capacity", () => {
    it("renders a paragraph", () => {
      setup();

      expect(screen.getByText(capacity)).toBeInTheDocument();
    });
  });

  describe("bullets", () => {
    it("renders a Bullet component for each item", () => {
      setup();

      expect(Bullet).toHaveBeenCalledTimes(bullets.length);
    });
  });
});

describe("RoleSkeleton", () => {
  it("renders a skeleton state", () => {
    render(<RoleSkeleton />);

    const numberOfPulses = 9;

    expect(screen.getAllByRole("status", { name: "Loading..." })).toHaveLength(
      numberOfPulses
    );
  });
});
