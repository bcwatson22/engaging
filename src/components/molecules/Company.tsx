"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useScrollTrigger } from "@/hooks/useScrollTrigger";

type Props = Scroll &
  Pick<Gig, "company" | "city" | "logo"> & {
    sectionId: string;
  };

const Company = ({ company, city, logo, sectionId, delay }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("print").matches);
  const triggerProps = useScrollTrigger({ ref, delay });
  const preferredProps =
    // prefersReducedMotion ? {} :
    triggerProps;

  return (
    <motion.header ref={ref} className="company" {...preferredProps}>
      <figure>
        {logo?.url && (
          <Image
            src={logo.url}
            alt={`${company} logo`}
            width={80}
            height={80}
            priority
          />
        )}
      </figure>
      <div>
        <h3 id={sectionId}>{company}</h3>
        <p className="mt-0">{city}</p>
      </div>
    </motion.header>
  );
};

export { Company };
export type { Props as CompanyProps };
