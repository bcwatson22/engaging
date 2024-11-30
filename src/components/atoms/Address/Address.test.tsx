import { expect, describe, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Address, AddressProps } from "./Address";
import { mockCV } from "@/data/mock/cv";

const defaultProps: AddressProps = {
  address: mockCV.address,
};

const setup = (props?: Partial<AddressProps>) =>
  render(<Address {...defaultProps} {...props} />);

describe("Address", () => {
  it("renders an address", () => {
    setup();

    const { id, ...mockAddress } = mockCV.address;

    for (const value of Object.values(mockAddress))
      expect(screen.getByText(value)).toBeInTheDocument();
  });
});
