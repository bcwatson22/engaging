import { vi, expect, describe, it, beforeEach, type Mock } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { Qualification, type QualificationProps } from "./Qualification";
import { Dates } from "@/components/atoms/Dates/Dates";

import { mockCV } from "@/data/mock/cv";

vi.mock("@/components/atoms/Dates/Dates", () => ({
  Dates: vi.fn(),
}));

const { institution, location, dates, description } = mockCV.qualifications[0];

const defaultProps: QualificationProps = {
  institution,
  location,
  dates,
  description,
};

const setup = (props?: Partial<QualificationProps>) => {
  (Dates as Mock).mockImplementation(() => null);

  render(<Qualification {...defaultProps} {...props} />);
};

describe("Qualification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders a section", () => {
    setup();

    expect(
      screen.getByRole("region", { name: institution })
    ).toBeInTheDocument();
  });

  describe("institution", () => {
    it("renders a heading", () => {
      setup();

      expect(
        screen.getByRole("heading", { level: 3, name: institution })
      ).toBeInTheDocument();
    });
  });

  describe("dates", () => {
    it("renders a Dates component", () => {
      setup();

      expect(Dates).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ dates }),
        {}
      );
    });
  });

  describe("description", () => {
    it("renders a paragraph", () => {
      setup();

      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });
});
