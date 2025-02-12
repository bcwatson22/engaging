import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cookieName } from "@/constants/common";

import { Cookie, CookieProps } from "./Cookie";

import { Copyright } from "@/components/atoms/Copyright/Copyright";

vi.mock("@/components/atoms/Copyright/Copyright", () => ({
  Copyright: vi.fn(),
}));

const defaultProps: CookieProps = {
  message: "Test message",
};

const setup = (props?: Partial<CookieProps>) =>
  render(<Cookie {...defaultProps} {...props} />);

describe("Cookie", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders an aside", () => {
    setup();

    expect(screen.getByRole("complementary")).toBeInTheDocument();
  });

  it("renders text", () => {
    setup();

    expect(screen.getByText(defaultProps.message)).toBeInTheDocument();
  });

  it("renders a button", () => {
    setup();

    expect(screen.getByRole("button", { name: "Cross" })).toBeInTheDocument();
  });

  it("sets storage when the button is clicked", async () => {
    Storage.prototype.setItem = vi.fn();

    setup();

    await userEvent.click(screen.getByRole("button", { name: "Cross" }));

    expect(localStorage.setItem).toHaveBeenNthCalledWith(
      1,
      cookieName,
      "dismissed"
    );
  });

  it("renders a Copyright component if hasCopyright is true", () => {
    setup({
      hasCopyright: true,
    });

    expect(Copyright).toHaveBeenNthCalledWith(1, { showRights: false }, {});
  });
});
