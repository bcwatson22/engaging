import { Suspense, useId } from 'react';

import {
  Company,
  CompanySkeleton,
} from '@/components/molecules/Company/Company';
import { Role, RoleSkeleton } from '@/components/molecules/Role/Role';

type Gig = ID &
  Pick<Company, 'company' | 'city' | 'logo'> & {
    roles: Role[];
  };

type Props = Scroll & Gig;

const GigSkeleton = () => (
  <div className="gig">
    <CompanySkeleton />
    <RoleSkeleton />
  </div>
);

const Gig = ({
  company,
  logo,
  city,
  roles,
  delay = 0,
  isImmediate = false,
}: Props) => {
  const sectionId = useId();

  const companyProps: Company = {
    company,
    logo,
    city,
    sectionId,
    delay,
    isImmediate,
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
export type { Props as GigProps };
