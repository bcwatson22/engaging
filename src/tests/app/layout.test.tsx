import { cleanup, render, screen } from "@testing-library/react";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import Layout, { type LayoutProps } from "@/app/layout";

import { Cookie } from "@/components/molecules/Cookie/Cookie";

vi.mock(import("next/font/google"), async (importOriginal: Function) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Nunito: vi.fn().mockReturnValue({ className: "mockClassName" }),
  };
});

vi.mock(import("@vercel/analytics/next"), async (importOriginal: Function) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Analytics: vi.fn(),
  };
});

vi.mock(
  import("@vercel/speed-insights/next"),
  async (importOriginal: Function) => {
    const actual = await importOriginal();
    return {
      ...actual,
      SpeedInsights: vi.fn(),
    };
  }
);

vi.mock("@/components/molecules/Cookie/Cookie", () => ({
  Cookie: vi.fn(),
}));

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

  it("renders a document", () => {
    setup();

    expect(screen.getByRole("document")).toBeInTheDocument();
  });

  it("renders children", () => {
    setup();

    expect(screen.getByRole("button", { name: mockText })).toBeInTheDocument();
  });

  it("renders a Cookie component", () => {
    setup();

    expect(Cookie).toHaveBeenCalledTimes(1);
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
