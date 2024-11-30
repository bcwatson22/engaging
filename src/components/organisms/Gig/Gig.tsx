import { Suspense, useId } from "react";

import {
  Company,
  CompanyProps,
  CompanySkeleton,
} from "@/components/molecules/Company/Company";
import { Role, RoleSkeleton } from "@/components/molecules/Role/Role";

type Props = Scroll & Gig;

const GigSkeleton = () => (
  <div className="gig">
    <CompanySkeleton />
    <RoleSkeleton />
  </div>
);

const Gig = ({ company, logo, city, roles, delay = 0 }: Props) => {
  const sectionId = useId();

  const companyProps: CompanyProps = {
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
