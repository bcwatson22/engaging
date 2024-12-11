import { Address, type TAddress } from "@/components/atoms/Address/Address";
import { Link, LinkSkeleton, type TLink } from "@/components/atoms/Link/Link";
import { SkeletonLine } from "@/components/atoms/Skeleton/Skeleton";

type Props = {
  address?: TAddress;
  links: TLink[];
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

const Details = ({ address, links }: Props) => (
  <>
    {address && <Address address={address} />}
    <address className="address">
      <ul>
        {links?.map((link) => (
          <li key={link?.id}>
            <Link link={link} />
          </li>
        ))}
      </ul>
    </address>
  </>
);

export { Details, DetailsSkeleton };
export { type Props as DetailsProps };
