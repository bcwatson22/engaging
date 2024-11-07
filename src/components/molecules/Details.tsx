import { Icon } from "../atoms/Icon";

type Props = {
  address?: Address;
  links: Link[];
};

const Details = ({ address, links }: Props) => {
  const { streetAddress, locality, countryName, postalCode } = address ?? {};

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
              <a href={target} className="link icon">
                <Icon icon={icon} />
                {text}
              </a>
            </li>
          ))}
        </ul>
      </address>
    </>
  );
};

export { Details };
