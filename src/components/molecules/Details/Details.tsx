// "use client";
// import { useState } from "react";

import { Link, LinkSkeleton } from "@/components/atoms/Link";
import { SkeletonLine } from "@/components/atoms/Skeleton";

type Props = {
  address?: Address;
  links: Link[];
};

const DetailsSkeleton = () => (
  <div className="details py-px">
    <SkeletonLine className="w-[16rem]" />
    <div className="flex gap-8 mt-6">
      {[...Array(2).keys()].map((key) => (
        <LinkSkeleton key={key} />
      ))}
    </div>
  </div>
);

const Details = ({ address, links }: Props) => {
  const { streetAddress, locality, countryName, postalCode } = address ?? {};

  // const [isLoading, setIsLoading] = useState<boolean>(true);

  return (
    // <>
    //   {isLoading ? (
    //     <DetailsSkeleton />
    //   ) : (
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
    //   )}
    //   <button onClick={() => setIsLoading(!isLoading)}>Toggle</button>
    // </>
  );
};

export { Details };
