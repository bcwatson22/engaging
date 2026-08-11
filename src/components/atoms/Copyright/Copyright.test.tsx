import { cleanup, render, screen, waitFor } from "@testing-library/react";

import { Copyright, type CopyrightProps } from "./Copyright";

const defaultProps: CopyrightProps = {
  showRights: true,
};

const setup = (props?: Partial<CopyrightProps>) =>
  render(<Copyright {...defaultProps} {...props} />);

describe("Copyright", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders copyright text", () => {
    setup();

    expect(screen.getByText(/©/i)).toBeInTheDocument();
  });

  describe("showRights", () => {
    it("animates rights reserved text when it's true", async () => {
      setup();

      await waitFor(() =>
        expect(screen.getByText(/All rights reserved/i)).toHaveStyle({
          opacity: 1,
        }),
      );
    });

    it("doesn't animate rights reserved text when it's false", async () => {
      setup({
        showRights: false,
      });

      await waitFor(() =>
        expect(screen.getByText(/All rights reserved/i)).not.toHaveStyle({
          opacity: 1,
        }),
      );
    });
  });
});
