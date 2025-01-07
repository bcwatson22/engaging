import { cleanup, render, screen } from "@testing-library/react";

import { Section, type SectionProps } from "./Section";

import { Divider } from "@/components/atoms/Divider/Divider";

vi.mock("@/components/atoms/Divider/Divider", () => ({
  Divider: vi.fn(),
}));

const mockHeading = "mockHeading";
const mockText = "mockText";
const mockChildren = <button>{mockText}</button>;
const mockDelay = 22;

const defaultProps: SectionProps = {
  heading: mockHeading,
  children: mockChildren,
  delay: mockDelay,
};

const setup = (props?: Partial<SectionProps>) =>
  render(<Section {...defaultProps} {...props} />);

describe("Section", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe("heading", () => {
    it("renders a Divider component", () => {
      setup();

      expect(Divider).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ heading: mockHeading, delay: mockDelay }),
        {}
      );
    });
  });

  describe("children", () => {
    it("renders children", () => {
      setup();

      expect(
        screen.getByRole("button", { name: mockText })
      ).toBeInTheDocument();
    });
  });
});
