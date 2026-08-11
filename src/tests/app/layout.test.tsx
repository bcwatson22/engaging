import { cleanup, render, screen } from "@testing-library/react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import Layout, { type LayoutProps } from "@/app/layout";

vi.mock(import("next/font/google"), async (importOriginal: Function) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Nunito: vi
      .fn<typeof import("next/font/google").Nunito>()
      /* The layout only reads className off the font object. */
      .mockReturnValue({ className: "mockClassName" } as ReturnType<
        typeof import("next/font/google").Nunito
      >),
  };
});

vi.mock(import("@vercel/analytics/next"), async (importOriginal: Function) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Analytics: vi.fn<typeof import("@vercel/analytics/next").Analytics>(),
  };
});

vi.mock(
  import("@vercel/speed-insights/next"),
  async (importOriginal: Function) => {
    const actual = await importOriginal();
    return {
      ...actual,
      SpeedInsights:
        vi.fn<typeof import("@vercel/speed-insights/next").SpeedInsights>(),
    };
  },
);

const mockText = "mockText";
const mockChildren = <button>{mockText}</button>;

const defaultProps: LayoutProps = {
  children: mockChildren,
};

const setup = (props?: Partial<LayoutProps>) =>
  render(<Layout {...defaultProps} {...props} />);

describe("Layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  /* React 19 hoists <html> and <body> onto the real document rather than
     nesting them in the container, so there is no "document" role to query. */
  it("renders a document", () => {
    setup();

    expect(document.documentElement).toHaveAttribute("lang", "en");
    expect(document.body).toHaveClass("mockClassName");
  });

  it("renders children", () => {
    setup();

    expect(screen.getByRole("button", { name: mockText })).toBeInTheDocument();
  });

  it("renders an Analytics component", () => {
    setup();

    expect(Analytics).toHaveBeenCalledTimes(1);
  });

  it("renders a SpeedInsights component", () => {
    setup();

    expect(SpeedInsights).toHaveBeenCalledTimes(1);
  });
});
