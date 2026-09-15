import { Address, type TAddress } from '@/components/atoms/Address/Address';
import { Link, LinkSkeleton, type TLink } from '@/components/atoms/Link/Link';
import { SkeletonLine } from '@/components/atoms/Skeleton/Skeleton';

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
  <div className="details">
    {hasParagraph && (
      <div className="flex h-6 items-center">
        <SkeletonLine className="w-[16rem] max-w-full" />
      </div>
    )}
    <div
      className={`xs:flex-row flex flex-col gap-x-8 xs:flex-wrap${hasParagraph ? ' mt-2 md:mt-4' : ''}`}
    >
      {[...Array(numOfLinks).keys()].map((key) => (
        <LinkSkeleton key={key} />
      ))}
    </div>
  </div>
);

const Details = ({ address, links }: Props) => (
  <>
    {address && <Address address={address} />}
    <address className="nav">
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
