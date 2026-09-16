import { render, screen } from '@testing-library/react';

import { mockCV } from '@/data/mock/cv';

import { Address, type AddressProps } from './Address';

const defaultProps: AddressProps = {
  address: mockCV.address,
};

const setup = (props?: Partial<AddressProps>) =>
  render(<Address {...defaultProps} {...props} />);

const { locality, region, streetAddress, postalCode, countryName } =
  mockCV.address;

const basedInText = 'Based in';

describe('Address', () => {
  it('renders an address', () => {
    setup();

    expect(screen.getByText(locality)).toBeInTheDocument();
    expect(screen.getByText(region)).toBeInTheDocument();
  });

  describe('isFull', () => {
    it(`renders 'Based in' and reduced details when it's false`, () => {
      setup();

      expect(screen.getByText(basedInText)).toBeInTheDocument();

      for (const value of [streetAddress, postalCode, countryName])
        expect(screen.queryByText(value)).not.toBeInTheDocument();
    });

    it(`renders full address details when it's true`, () => {
      setup({ isFull: true });

      for (const value of Object.values(mockCV.address))
        expect(screen.getByText(value)).toBeInTheDocument();

      expect(screen.queryByText(basedInText)).not.toBeInTheDocument();
    });
  });
});
