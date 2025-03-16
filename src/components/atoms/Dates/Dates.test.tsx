import { cleanup, render, screen } from "@testing-library/react";

import { Dates, type DatesProps } from "./Dates";

import { mockCV } from "@/data/mock/cv";

const mockDates = mockCV.gigs[1].roles[0].dates;

const defaultProps: DatesProps = {
  dates: [mockDates[0], mockDates[1]],
};

const setup = (props?: Partial<DatesProps>) =>
  render(<Dates {...defaultProps} {...props} />);

describe("Dates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe("dates", () => {
    describe("when there are 2 different values", () => {
      it("renders each of them", () => {
        setup();

        const timeElems = screen.getAllByRole("time");

        for (const [index, value] of defaultProps.dates.entries())
          expect(timeElems[index]).toHaveAttribute("datetime", value);
      });
    });

    describe("when there are 2 values that are the same", () => {
      it("renders the value", () => {
        const mockDate = mockDates[0];

        setup({
          dates: [mockDate, mockDate],
        });

        expect(screen.getByRole("time")).toHaveAttribute("datetime", mockDate);
      });
    });

    describe("when there is 1 value", () => {
      it("renders the value with ' - present", () => {
        const mockDate = mockDates[1];

        setup({
          dates: [mockDate],
        });

        expect(screen.getByRole("time")).toHaveAttribute("datetime", mockDate);
        expect(
          screen.getByText("present", { exact: false })
        ).toBeInTheDocument();
      });
    });
  });

  describe("className", () => {
    it("renders if provided", () => {
      const mockClassName = "mockClassName";

      setup({ className: mockClassName });

      expect(
        screen
          .getByText(mockDates[0].split("-")[0], { exact: false })
          .closest("p")
      ).toHaveClass(mockClassName);
    });
  });
});
