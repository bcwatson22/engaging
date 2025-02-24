import type { TAddress } from "@/components/atoms/Address/Address";
import type { TIntro } from "@/components/atoms/Intro/Intro";
import type { TLink } from "@/components/atoms/Link/Link";
import type { TLogo } from "@/components/atoms/Logo/Logo";
import type { TQualification } from "@/components/molecules/Qualification/Qualification";
import type { TReference } from "@/components/molecules/Reference/Reference";
import type { TGig } from "@/components/organisms/Gig/Gig";

export type TCV = TID &
  TLogo &
  TIntro & {
    meta: TMeta;
    address: TAddress;
    contactLinks: TLink[];
    gigs: TGig[];
    skills: string;
    qualifications: TQualification[];
    onlineLinks: TLink[];
    references: TReference[];
  };
