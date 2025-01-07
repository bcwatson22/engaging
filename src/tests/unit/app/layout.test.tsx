import { cleanup, render, screen } from "@testing-library/react";

import { SpeedInsights } from "@vercel/speed-insights/next";

import Layout, { type LayoutProps } from "@/app/layout";

vi.mock(import("@vercel/speed-insights/next"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    SpeedInsights: vi.fn(),
  };
});

vi.mock(import("next/font/google"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Nunito: vi.fn().mockReturnValue({ className: "mockClassName" }),
  };
});

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

  it("renders a SpeedInsights component", () => {
    setup();

    expect(SpeedInsights).toHaveBeenCalledTimes(1);
  });
});
