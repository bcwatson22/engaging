type Address = ID & {
  streetAddress: string;
  locality: string;
  region: string;
  countryName: string;
  postalCode: string;
};

type Props = {
  address: Address;
  isFull?: boolean;
};

const Address = ({
  address: { streetAddress, locality, region, countryName, postalCode },
  isFull = false,
}: Props) => (
  <p className="h-adr">
    {isFull ? (
      <span className="p-street-address">{streetAddress}</span>
    ) : (
      'Based in '
    )}
    <span className="p-locality">{locality}</span>
    <span className="p-region">{region}</span>
    {isFull && (
      <>
        <span className="p-postal-code">{postalCode}</span>
        <span className="p-country-name sr-only">{countryName}</span>
      </>
    )}
  </p>
);

export { Address };
export type { Props as AddressProps };
