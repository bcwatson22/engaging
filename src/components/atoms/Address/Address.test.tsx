import { render, screen } from "@testing-library/react";

import { Address, type AddressProps } from "./Address";

import { mockCV } from "@/data/mock/cv";

const defaultProps: AddressProps = {
  address: mockCV.address,
};

const setup = (props?: Partial<AddressProps>) =>
  render(<Address {...defaultProps} {...props} />);

describe("Address", () => {
  it("renders an address", () => {
    setup();

    for (const value of Object.values(mockCV.address))
      expect(screen.getByText(value)).toBeInTheDocument();
  });
});
