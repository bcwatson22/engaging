"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

import {
  Skeleton,
  SkeletonHeading,
  SkeletonLine,
} from "@/components/atoms/Skeleton/Skeleton";
import { companyLogoDimensions } from "@/constants/dimensions";
import { useScrollTrigger } from "@/hooks/useScrollTrigger";

type TCompany = TScroll &
  Pick<TPosition, "company"> & {
    city: string;
    logo: TAsset;
    sectionId: string;
  };

type Props = TCompany;

const { width, height } = companyLogoDimensions;

const CompanySkeleton = () => (
  <div className="company">
    <Skeleton className="company-logo bg-zinc-300 dark:bg-zinc-700" />
    <div className="company-details">
      <SkeletonHeading level="h3" className="w-32" />
      <SkeletonLine className="mt-2 w-20" />
    </div>
  </div>
);

const Company = ({ company, city, logo, sectionId, delay }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const triggerProps = useScrollTrigger({ ref, delay });

  const alt = `${company} logo`;

  return (
    <motion.header ref={ref} className="company" {...triggerProps}>
      {logo?.url && (
        <>
          <figure className="company-logo screen-company-logo">
            <Image
              src={logo.url}
              alt={alt}
              width={width}
              height={height}
              sizes={`(min-width: 768px) ${width}px, 60px`}
              loading="lazy"
            />
          </figure>
          <div className="company-logo print-company-logo">
            <figure
              className="company-icon"
              style={{ backgroundImage: `url(${logo.url})` }}
            >
              <figcaption>{alt}</figcaption>
            </figure>
          </div>
        </>
      )}
      <div className="company-details">
        <h3 id={sectionId}>{company}</h3>
        <p className="mt-0">{city}</p>
      </div>
    </motion.header>
  );
};

export { Company, CompanySkeleton };
export type { TCompany, Props as CompanyProps };
