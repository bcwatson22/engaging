import type { Mock } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import type { Target } from "framer-motion";

import { Company, CompanySkeleton, type CompanyProps } from "./Company";

import { useScrollTrigger } from "@/hooks/useScrollTrigger";
import { mockCV } from "@/data/mock/cv";

vi.mock("@/hooks/useScrollTrigger", () => ({
  useScrollTrigger: vi.fn(),
}));

type UseScrollTrigger = Partial<ReturnType<typeof useScrollTrigger>>;

type SetupOptions = {
  useScrollTrigger: UseScrollTrigger;
};

const defaultScrollTrigger: UseScrollTrigger = {
  initial: { opacity: 0, y: "10px" },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0 },
};

const { company, logo, city } = mockCV.gigs[0];
const mockSectionId = "mockSectionId";

const defaultProps: CompanyProps = {
  company,
  logo,
  city,
  sectionId: mockSectionId,
};

const setup = (
  options?: Partial<SetupOptions>,
  props?: Partial<CompanyProps>
) => {
  const setupOptions: SetupOptions = {
    useScrollTrigger: defaultScrollTrigger,
    ...options,
  };

  (useScrollTrigger as Mock).mockReturnValue(setupOptions.useScrollTrigger);

  render(<Company {...defaultProps} {...props} />);
};

describe("Company", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("uses the initial values returned from useScrollTrigger for the header style", () => {
    setup();

    const { opacity, y } = defaultScrollTrigger.initial as Target;

    expect(screen.getByRole("banner")).toHaveStyle({
      opacity,
      transform: `translateY(${y})`,
    });
  });

  describe("company", () => {
    it("renders a heading", () => {
      setup();

      expect(
        screen.getByRole("heading", { level: 3, name: company })
      ).toBeInTheDocument();
    });
  });

  describe("city", () => {
    it("renders a paragraph", () => {
      setup();

      expect(screen.getByText(city)).toBeInTheDocument();
    });
  });

  describe("logo", () => {
    it("renders an image if defined", () => {
      setup();

      expect(
        screen.getByRole("img", { name: `${company} logo` })
      ).toHaveAttribute(
        "src",
        expect.stringContaining(encodeURIComponent(logo.url))
      );
    });

    it("doesn't render an image if undefined", () => {
      setup(
        {},
        {
          logo: undefined,
        }
      );

      expect(
        screen.queryByRole("img", { name: `${company} logo` })
      ).not.toBeInTheDocument();
    });
  });

  describe("sectionId", () => {
    it("is used for the heading id value", () => {
      setup();

      expect(
        screen.getByRole("heading", { level: 3, name: company })
      ).toHaveAttribute("id", mockSectionId);
    });
  });
});

describe("CompanySkeleton", () => {
  it("renders a skeleton state", () => {
    render(<CompanySkeleton />);

    const numberOfPulses = 3;

    expect(screen.getAllByRole("status", { name: "Loading..." })).toHaveLength(
      numberOfPulses
    );
  });
});
