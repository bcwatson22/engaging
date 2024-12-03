import { expect, describe, it, vi, Mock, beforeEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { useScrollTrigger } from "@/hooks/useScrollTrigger";
import { Divider, DividerProps } from "./Divider";

vi.mock("@/hooks/useScrollTrigger", () => ({
  useScrollTrigger: vi.fn(),
}));

type UseScrollTrigger = Partial<ReturnType<typeof useScrollTrigger>>;

type SetupOptions = {
  useScrollTrigger: UseScrollTrigger;
};

const defaultScrollTrigger = {
  initial: { opacity: 0, y: "10px" },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0 },
};

const mockHeading = "mock-heading";

const defaultProps: DividerProps = {
  heading: mockHeading,
};

const setup = (
  options?: Partial<SetupOptions>,
  props?: Partial<DividerProps>
) => {
  const setupOptions: SetupOptions = {
    useScrollTrigger: defaultScrollTrigger,
    ...options,
  };

  (useScrollTrigger as Mock).mockReturnValue(setupOptions.useScrollTrigger);

  render(<Divider {...defaultProps} {...props} />);
};

describe("Divider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders a heading", () => {
    setup();

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: new RegExp(mockHeading, "i"),
      })
    ).toBeInTheDocument();
  });

  it("uses the initial values returned from useScrollTrigger for the heading style", () => {
    setup();

    const { opacity, y } = defaultScrollTrigger.initial;

    expect(screen.getByRole("heading")).toHaveStyle({
      opacity,
      transform: `translateY(${y})`,
    });
  });
});
