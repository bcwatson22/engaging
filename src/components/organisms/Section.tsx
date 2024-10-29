"use client";

import { ReactNode, useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { getScrollTriggerProps } from "../../utils/getScrollTriggerProps";

type Props = Scroll & {
  heading: string;
  children: ReactNode;
  className?: string;
};

export const Section = ({ heading, children, className, delay = 0 }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["end end", "start center"],
  });

  return (
    <>
      <div ref={ref}>
        <motion.h2 className="divider" {...getScrollTriggerProps(delay)}>
          {heading}:{" "}
          <motion.span style={{ scaleX: scrollYProgress }}>Divider</motion.span>
        </motion.h2>
      </div>
      <article className={`content${className ? " " + className : ""}`}>
        {children}
      </article>
    </>
  );
};
