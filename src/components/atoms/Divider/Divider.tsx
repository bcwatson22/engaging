"use client";

import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { useScrollTrigger } from "@/hooks/useScrollTrigger";

type TProps = TScroll & {
  heading: string;
};

const Divider = ({ heading, delay = 0 }: TProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["end end", "start center"],
  });
  const triggerProps = useScrollTrigger({ ref, delay });

  return (
    <div ref={ref}>
      <motion.h2 className="divider" {...triggerProps}>
        {heading}:{" "}
        <motion.span style={{ scaleX: scrollYProgress }}>Divider</motion.span>
      </motion.h2>
    </div>
  );
};

export { Divider };
export type { TProps as DividerProps };
