type TAddress = TID & {
  streetAddress: string;
  locality: string;
  region: string;
  countryName: string;
  postalCode: string;
};

type Props = {
  address: TAddress;
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
    {isFull ? (
      <>
        <span className="p-postal-code">{postalCode}</span>
        <span className="p-country-name sr-only">{countryName}</span>
      </>
    ) : (
      <span className="p-region">{region}</span>
    )}
  </p>
);

export { Address };
export type { TAddress, Props as AddressProps };
