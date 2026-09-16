import type { Address } from '@/components/atoms/Address/Address';
import type { Intro } from '@/components/atoms/Intro/Intro';
import type { Link } from '@/components/atoms/Link/Link';
import type { Logo } from '@/components/atoms/Logo/Logo';
import type { Qualification } from '@/components/molecules/Qualification/Qualification';
import type { Reference } from '@/components/molecules/Reference/Reference';
import type { Gig } from '@/components/organisms/Gig/Gig';

export type CV = ID &
  Logo &
  Intro & {
    meta: Meta;
    address: Address;
    contactLinks: Link[];
    gigs: Gig[];
    skills: string;
    qualifications: Qualification[];
    onlineLinks: Link[];
    references: Reference[];
  };
