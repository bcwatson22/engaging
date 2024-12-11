import { Suspense, useId } from "react";

import {
  Company,
  CompanySkeleton,
  type TCompany,
} from "@/components/molecules/Company/Company";
import {
  Role,
  RoleSkeleton,
  type TRole,
} from "@/components/molecules/Role/Role";

type TGig = TID &
  Pick<TCompany, "company" | "city" | "logo"> & {
    roles: TRole[];
  };

type Props = TScroll & TGig;

const GigSkeleton = () => (
  <div className="gig">
    <CompanySkeleton />
    <RoleSkeleton />
  </div>
);

const Gig = ({ company, logo, city, roles, delay = 0 }: Props) => {
  const sectionId = useId();

  const companyProps: TCompany = {
    company,
    logo,
    city,
    sectionId,
    delay,
  };

  return (
    <section aria-labelledby={sectionId} className="gig">
      <Suspense>
        <Company {...companyProps} />
      </Suspense>
      {roles.map((role, index) => (
        <Role key={role.id} {...role} index={index} total={roles.length} />
      ))}
    </section>
  );
};

export { Gig, GigSkeleton };
export type { TGig };
