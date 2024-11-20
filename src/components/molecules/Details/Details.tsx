import { Link, LinkSkeleton } from "@/components/atoms/Link";
import { SkeletonLine } from "@/components/atoms/Skeleton";

type Props = {
  address?: Address;
  links: Link[];
};

type SkeletonProps = {
  hasParagraph?: boolean;
  numOfLinks?: number;
};

const DetailsSkeleton = ({
  hasParagraph = false,
  numOfLinks = 2,
}: SkeletonProps) => (
  <div className="details py-px">
    {hasParagraph && <SkeletonLine className="w-[16rem] mb-6" />}
    <div className="flex gap-8">
      {[...Array(numOfLinks).keys()].map((key) => (
        <LinkSkeleton key={key} />
      ))}
    </div>
  </div>
);

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
          {links?.map((link) => (
            <li key={link.id}>
              <Link link={link} />
            </li>
          ))}
        </ul>
      </address>
    </>
  );
};

export { Details, DetailsSkeleton };
