import { cleanup, render, screen } from "@testing-library/react";

import { Role, RoleSkeleton, type RoleProps, getLinkClassNames } from "./Role";

import { Bullet } from "@/components/atoms/Bullet/Bullet";
import { Dates } from "@/components/atoms/Dates/Dates";

import { mockCV } from "@/data/mock/cv";

vi.mock(
  import("@/components/atoms/Bullet/Bullet"),
  async (importOriginal: Function) => {
    const actual = await importOriginal();
    return {
      ...actual,
      Bullet: vi.fn(),
    };
  }
);

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

  describe("total", () => {
    it("adds 'multiple' class if higher than 1", () => {
      setup({
        total: 2,
      });

      expect(screen.getByRole("heading", { level: 4, name: role })).toHaveClass(
        "multiple"
      );
    });
  });
});

describe("RoleSkeleton", () => {
  it("renders a skeleton state", () => {
    render(<RoleSkeleton />);

    const numOfPulses = 9;

    expect(screen.getAllByRole("status", { name: "Loading..." })).toHaveLength(
      numOfPulses
    );
  });
});

describe("getLinkClassNames", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns empty string if hasMultiple is false", () => {
    expect(getLinkClassNames(0, 5, false)).toBe("");
  });

  it("returns 'linker' if index is 0'", () => {
    expect(getLinkClassNames(0, 10, true)).toBe(" linker");
  });

  it("returns both 'linker' and 'linkee' if index is less than total'", () => {
    expect(getLinkClassNames(5, 10, true)).toBe(" linker linkee");
  });

  it("returns both 'linkee' if index is the same as total'", () => {
    expect(getLinkClassNames(10, 10, true)).toBe(" linkee");
  });

  it("returns empty string as default", () => {
    expect(getLinkClassNames(12, 10, true)).toBe("");
  });
});
