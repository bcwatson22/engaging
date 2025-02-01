import { Suspense } from "react";

import { Dates } from "@/components/atoms/Dates/Dates";
import { Bullet, BulletSkeleton } from "@/components/atoms/Bullet/Bullet";
import {
  SkeletonHeading,
  SkeletonLine,
} from "@/components/atoms/Skeleton/Skeleton";

type TRole = TID &
  Pick<TPosition, "role"> & {
    dates: string[];
    bullets: string[];
    capacity: string;
  };

type Props = TRole & {
  index: number;
  total: number;
};

const getLinkClassNames = (
  index: number,
  total: number,
  hasMultiple = false
): string => {
  switch (true) {
    case !hasMultiple:
      return "";
    case index === 0:
      return " linker";
    case index < total:
      return " linker linkee";
    case index === total:
      return " linkee";
    default:
      return "";
  }
};

const RoleSkeleton = () => (
  <div className="role mt-5">
    <SkeletonHeading level="h4" className="w-[14rem]" />
    <SkeletonLine className="mt-2 w-[17rem] mb-6" />
    {[...Array(7).keys()].map((key, index) => (
      <BulletSkeleton key={key} index={index} />
    ))}
  </div>
);

const Role = ({ role, dates, capacity, bullets, index, total }: Props) => {
  const hasMultiple = total > 1;
  const linkClassNames = getLinkClassNames(index, total - 1, hasMultiple);

  return (
    <div className={`role${linkClassNames}`}>
      <h4
        className={`text-brand-blue dark:text-brand-yellow${
          hasMultiple ? " multiple" : ""
        }`}
      >
        {role}
      </h4>
      <div className="flex flex-wrap mb-4 print:mb-1">
        <Suspense>
          <Dates dates={dates} className="mr-2" />
        </Suspense>
        <p className="capacity">{capacity}</p>
      </div>
      <ul className="bullets">
        {bullets.map((content) => (
          <Suspense key={content.slice(0, 15)}>
            <Bullet>{content}</Bullet>
          </Suspense>
        ))}
      </ul>
    </div>
  );
};

export { Role, RoleSkeleton, getLinkClassNames };
export type { TRole, Props as RoleProps };
