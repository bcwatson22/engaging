import { cleanup, render, screen } from "@testing-library/react";

import LoadingPage from "@/app/loading";

import { MugshotSkeleton } from "@/components/organisms/Mugshot/Mugshot";

vi.mock(
  import("@/components/organisms/Mugshot/Mugshot"),
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      MugshotSkeleton: vi.fn(),
    };
  }
);

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

  it("renders a heading", () => {
    setup();

    expect(
      screen.getByRole("heading", { name: "Engaging Engineering" })
    ).toBeInTheDocument();
  });

  it("renders a MugshotSkeleton component", () => {
    setup();

    expect(MugshotSkeleton).toHaveBeenCalledTimes(1);
  });
});
