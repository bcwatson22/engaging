type Props = {
  address?: Address;
  links: Link[];
};

export const Details = ({ address, links }: Props) => {
  const { streetAddress, locality, countryName, postalCode } = address ?? {};

  /* 
    Tailwind made me do it! 
    Options are: phone // email // website // profile // repo 
  */

  return (
    <>
      {address && (
        <p className="h-adr">
          <span className="p-street-address">{streetAddress}</span>
          <span className="p-locality">{locality}</span>
          <span className="p-country-name sr-only">{countryName}</span>
          <span className="p-postal-code">{postalCode}</span>
        </p>
      )}
      <address className="address">
        <ul>
          {links?.map(({ id, text, target, icon }) => (
            <li key={id}>
              <a
                href={target}
                className={`link border-y- icon ${icon.toLowerCase()}`}
              >
                {text}
              </a>
            </li>
          ))}
        </ul>
      </address>
    </>
  );
};
