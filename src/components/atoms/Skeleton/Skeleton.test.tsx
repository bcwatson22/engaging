import { cleanup, render, screen } from "@testing-library/react";

import {
  Skeleton,
  SkeletonLine,
  SkeletonHeading,
  SkeletonParagraph,
  label,
} from "./Skeleton";

describe("Skeleton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders a Skeleton loading state", () => {
    render(<Skeleton />);

    expect(screen.getByRole("status", { name: label })).toBeInTheDocument();
  });
});

describe("SkeletonLine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders a SkeletonLine loading state", () => {
    render(<SkeletonLine />);

    expect(screen.getByRole("status", { name: label })).toBeInTheDocument();
  });
});

describe("SkeletonHeading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders a SkeletonHeading loading state", () => {
    render(<SkeletonHeading />);

    expect(screen.getByRole("status", { name: label })).toBeInTheDocument();
  });
});

describe("SkeletonParagraph", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders a SkeletonParagraph loading state", () => {
    const numberOfLines = 7;

    render(<SkeletonParagraph numOfLines={numberOfLines} />);

    expect(screen.getAllByRole("status", { name: label })).toHaveLength(
      numberOfLines
    );
  });

  describe("className", () => {
    it("renders if provided", () => {
      const mockClassName = "mockClassName";

      render(<SkeletonParagraph numOfLines={1} className={mockClassName} />);

      expect(
        screen.getByRole("status", { name: label }).parentElement
      ).toHaveClass(mockClassName);
    });
  });
});
