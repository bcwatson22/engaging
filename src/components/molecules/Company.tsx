"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { getScrollTriggerProps } from "../../utils/getScrollTriggerProps";

type Props = Scroll &
  Pick<Gig, "company" | "city" | "logo"> & {
    sectionId: string;
  };

export const Company = ({ company, city, logo, sectionId, delay }: Props) => (
  <motion.header className="company" {...getScrollTriggerProps(delay, "-25%")}>
    <figure className="icon">
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
