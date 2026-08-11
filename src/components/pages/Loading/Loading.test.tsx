import { cleanup, render, screen } from "@testing-library/react";

import { DetailsSkeleton } from "@/components/molecules/Details/Details";
import { HeaderSkeleton } from "@/components/molecules/Header/Header";
import { GigSkeleton } from "@/components/organisms/Gig/Gig";
import { Section } from "@/components/organisms/Section/Section";

import { Loading } from "./Loading";

vi.mock(
  import("@/components/molecules/Details/Details"),
  async (importOriginal: Function) => {
    const actual = await importOriginal();
    return {
      ...actual,
      DetailsSkeleton:
        vi.fn<
          typeof import("@/components/molecules/Details/Details").DetailsSkeleton
        >(),
    };
  },
);

vi.mock(
  import("@/components/molecules/Header/Header"),
  async (importOriginal: Function) => {
    const actual = await importOriginal();
    return {
      ...actual,
      HeaderSkeleton:
        vi.fn<
          typeof import("@/components/molecules/Header/Header").HeaderSkeleton
        >(),
    };
  },
);

vi.mock(
  import("@/components/organisms/Gig/Gig"),
  async (importOriginal: Function) => {
    const actual = await importOriginal();
    return {
      ...actual,
      GigSkeleton:
        vi.fn<typeof import("@/components/organisms/Gig/Gig").GigSkeleton>(),
    };
  },
);

vi.mock("@/components/organisms/Section/Section", () => ({
  Section: vi
    .fn<typeof import("@/components/organisms/Section/Section").Section>()
    .mockImplementation(({ children }) => <>{children}</>),
}));

const setup = () => render(<Loading />);

describe("Loading", () => {
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
        {},
      );
  });

  it("renders a DetailsSkeleton component", () => {
    setup();

    expect(DetailsSkeleton).toHaveBeenNthCalledWith(
      1,
      { hasParagraph: true },
      {},
    );
  });

  it("renders GigSkeleton components", () => {
    setup();

    expect(GigSkeleton).toHaveBeenCalledTimes(3);
  });
});
