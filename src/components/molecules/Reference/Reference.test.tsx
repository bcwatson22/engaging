import { cleanup, render, screen } from "@testing-library/react";

import { Reference, type ReferenceProps } from "./Reference";

import { Link } from "@/components/atoms/Link/Link";

import { mockCV } from "@/data/mock/cv";

vi.mock("@/components/atoms/Link/Link", () => ({
  Link: vi.fn(),
}));

const { person, role, company, link } = mockCV.references[0];

const defaultProps: ReferenceProps = {
  person,
  role,
  company,
  link,
};

const setup = (props?: Partial<ReferenceProps>) =>
  render(<Reference {...defaultProps} {...props} />);

describe("Reference", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders a section", () => {
    setup();

    expect(screen.getByRole("region", { name: person })).toBeInTheDocument();
  });

  describe("person", () => {
    it("renders a heading", () => {
      setup();

      expect(
        screen.getByRole("heading", { level: 3, name: person })
      ).toBeInTheDocument();
    });
  });

  describe("role // company", () => {
    it("renders a paragraph", () => {
      setup();

      expect(screen.getByText(`${role}, ${company}`)).toBeInTheDocument();
    });
  });

  describe("link", () => {
    it("renders a Link component", () => {
      setup();

      expect(Link).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ link }),
        {}
      );
    });
  });
});
