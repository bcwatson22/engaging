import { cleanup, render, screen } from "@testing-library/react";

import NotFoundPage from "@/app/not-found";

import { Link } from "@/components/atoms/Link/Link";
import { Error } from "@/components/pages/Error/Error";

vi.mock(
  import("@/components/atoms/Link/Link"),
  async (importOriginal: Function) => {
    const actual = await importOriginal();
    return {
      ...actual,
      Link: vi.fn(),
    };
  }
);

vi.mock(
  import("@/components/pages/Error/Error"),
  async (importOriginal: Function) => {
    const actual = await importOriginal();
    return {
      ...actual,
      Error: vi.fn().mockImplementation(({ children }) => <>{children}</>),
    };
  }
);

const setup = () => render(<NotFoundPage />);

describe("NotFoundPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders an Error component", () => {
    setup();

    expect(Error).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ heading: "Are you lost?" }),
      {}
    );
  });

  it("renders a message", () => {
    setup();

    expect(
      screen.getByText(/We couldn\'t find what you were looking for/i)
    ).toBeInTheDocument();
  });

  it("renders a Link component", () => {
    setup();

    expect(Link).toHaveBeenNthCalledWith(
      1,
      { link: { icon: "Home", target: "/", text: "Home" } },
      {}
    );
  });
});
