import { cleanup, render, screen } from "@testing-library/react";

import LoadingPage from "@/app/cv/loading";

import { DetailsSkeleton } from "@/components/molecules/Details/Details";
import { HeaderSkeleton } from "@/components/molecules/Header/Header";
import { GigSkeleton } from "@/components/organisms/Gig/Gig";
import { Section } from "@/components/organisms/Section/Section";

vi.mock(
  import("@/components/molecules/Details/Details"),
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      DetailsSkeleton: vi.fn(),
    };
  }
);

vi.mock(
  import("@/components/molecules/Header/Header"),
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      HeaderSkeleton: vi.fn(),
    };
  }
);

vi.mock(import("@/components/organisms/Gig/Gig"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    GigSkeleton: vi.fn(),
  };
});

vi.mock("@/components/organisms/Section/Section", () => ({
  Section: vi.fn().mockImplementation(({ children }) => <>{children}</>),
}));

const setup = () => render(<LoadingPage />);

describe("LoadingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders a main", () => {
    setup();

    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders a HeaderSkeleton component", () => {
    setup();

    expect(HeaderSkeleton).toHaveBeenCalledTimes(1);
  });

  it("renders sections", () => {
    setup();

    const sections = ["Digits", "Experience"];

    for (const [index, value] of sections.entries())
      expect(Section).toHaveBeenNthCalledWith(
        index + 1,
        expect.objectContaining({ heading: value }),
        {}
      );
  });

  it("renders a DetailsSkeleton component", () => {
    setup();

    expect(DetailsSkeleton).toHaveBeenNthCalledWith(
      1,
      { hasParagraph: true },
      {}
    );
  });

  it("renders GigSkeleton components", () => {
    setup();

    expect(GigSkeleton).toHaveBeenCalledTimes(3);
  });
});
