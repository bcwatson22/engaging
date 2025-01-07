import { cleanup, render, screen } from "@testing-library/react";

import { Icon, type IconProps, iconOptions } from "./Icon";

const defaultProps: IconProps = {
  icon: "User",
  isHidden: false,
};

const setup = (props?: Partial<IconProps>) =>
  render(<Icon {...defaultProps} {...props} />);

describe("Icon", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe("icon", () => {
    it.each(iconOptions)("uses the %s icon", async (icon) => {
      setup({ icon });

      expect(
        screen.getByRole("graphics-symbol", { name: icon })
      ).toBeInTheDocument();
    });
  });
});
