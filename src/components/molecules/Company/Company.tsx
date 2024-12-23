"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRef } from "react";

import { useScrollTrigger } from "@/hooks/useScrollTrigger";

import {
  Skeleton,
  SkeletonHeading,
  SkeletonLine,
} from "@/components/atoms/Skeleton/Skeleton";

type TCompany = TScroll &
  Pick<TPosition, "company"> & {
    city: string;
    logo: TAsset;
    sectionId: string;
  };

type TProps = TCompany;

const CompanySkeleton = () => (
  <div className="company">
    <Skeleton className="company-logo bg-zinc-300 dark:bg-zinc-700" />
    <div className="company-details">
      <SkeletonHeading level="h3" className="w-[8rem]" />
      <SkeletonLine className="mt-2 w-[5rem]" />
    </div>
  </div>
);

const Company = ({ company, city, logo, sectionId, delay }: TProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const triggerProps = useScrollTrigger({ ref, delay });

  return (
    <motion.header ref={ref} className="company" {...triggerProps}>
      {logo?.url && (
        <figure className="company-logo">
          <Image
            src={logo.url}
            alt={`${company} logo`}
            width={80}
            height={80}
            priority
          />
        </figure>
      )}
      <div className="company-details">
        <h3 id={sectionId}>{company}</h3>
        <p className="mt-0">{city}</p>
      </div>
    </motion.header>
  );
};

export { Company, CompanySkeleton };
export type { TCompany, TProps as CompanyProps };
