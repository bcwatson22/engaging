import { cleanup, render, screen } from "@testing-library/react";

import { Link, LinkSkeleton, type LinkProps } from "./Link";

import { Icon } from "@/components/atoms/Icon/Icon";

import { mockCV } from "@/data/mock/cv";

vi.mock("@/components/atoms/Icon/Icon", () => ({
  Icon: vi.fn(),
}));

const mockLink = mockCV.onlineLinks[1];
const { text, target, icon } = mockLink!;

const defaultProps: LinkProps = {
  link: mockLink,
};

const setup = (props?: Partial<LinkProps>) =>
  render(<Link {...defaultProps} {...props} />);

describe("Link", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe("link", () => {
    it("renders an anchor", () => {
      setup();

      expect(screen.getByRole("link", { name: text })).toBeInTheDocument();
    });

    it("renders an Icon component", () => {
      setup();

      expect(Icon).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ icon }),
        {}
      );
    });

    describe("target", () => {
      it("is used for the href value", () => {
        setup();

        expect(screen.getByRole("link")).toHaveAttribute("href", target);
      });

      describe("when it's a URL", () => {
        it("adds url class", () => {
          setup();

          expect(screen.getByRole("link")).toHaveClass("url");
        });

        it("removes protocol for remote data-url value", () => {
          setup();

          expect(
            screen.getByRole("link").getAttribute("data-url")
          ).not.toContain("http");
        });

        it("adds domain for local data-url value", () => {
          setup({
            link: mockCV.onlineLinks[0],
          });

          expect(screen.getByRole("link").getAttribute("data-url")).toContain(
            "engaging.engineering"
          );
        });
      });

      describe("when it's a phone number or email address", () => {
        it("doesn't add url class", () => {
          setup({
            link: mockCV.contactLinks[0],
          });

          expect(screen.getByRole("link")).not.toHaveClass("url");
        });

        it("doesn't have a data-url", () => {
          setup({
            link: mockCV.contactLinks[0],
          });

          expect(screen.getByRole("link")).not.toHaveAttribute("data-url");
        });
      });
    });
  });
});

describe("LinkSkeleton", () => {
  it("renders a skeleton state", () => {
    render(<LinkSkeleton />);

    const numOfPulses = 2;

    expect(screen.getAllByRole("status", { name: "Loading..." })).toHaveLength(
      numOfPulses
    );
  });
});
