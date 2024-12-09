import { vi, expect, describe, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { Intro, type IntroProps } from "./Intro";
import { mockCV } from "@/data/mock/cv";

const mockSplit = mockCV.intro.split("\n\n");
const mockToday = new Date(2024, 12, 8);

const defaultProps: IntroProps = {
  intro: mockSplit[1],
};

const setup = (props?: Partial<IntroProps>) =>
  render(<Intro {...defaultProps} {...props} />);

describe("Intro", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(mockToday);
    cleanup();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("intro", () => {
    it("renders the content", () => {
      setup();

      expect(screen.getByText(mockSplit[1])).toBeInTheDocument();
    });

    it("replaces moustache with year value", () => {
      setup({
        intro: mockSplit[0],
      });

      expect(
        screen.getByText(/with 12 years' experience/i)
      ).toBeInTheDocument();
    });
  });
});