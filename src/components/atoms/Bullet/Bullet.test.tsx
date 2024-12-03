import { expect, describe, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { Bullet, BulletProps } from "./Bullet";

const mockChildren = "mock-children";

const defaultProps: BulletProps = {
  children: <button>{mockChildren}</button>,
};

const setup = (props?: Partial<BulletProps>) =>
  render(<Bullet {...defaultProps} {...props} />);

describe("Bullet", () => {
  it("renders a listitem", () => {
    setup();

    expect(
      within(screen.getByRole("listitem")).getByRole("button", {
        name: mockChildren,
      })
    ).toBeInTheDocument();
  });
});
