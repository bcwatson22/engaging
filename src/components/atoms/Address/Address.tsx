type Props = {
  address: Address;
};

const Address = ({
  address: { streetAddress, locality, countryName, postalCode },
}: Props) => (
  <p className="h-adr">
    <span className="p-street-address">{streetAddress}</span>
    <span className="p-locality">{locality}</span>
    <span className="p-country-name sr-only">{countryName}</span>
    <span className="p-postal-code">{postalCode}</span>
  </p>
);

export { Address };
