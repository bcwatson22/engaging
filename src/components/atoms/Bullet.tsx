"use client";

import { useScroll, motion } from "framer-motion";
import { ReactNode, useRef } from "react";

type Props = {
  children: ReactNode;
};

export const Bullet = ({ children }: Props) => {
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["end end", "start 80vw"],
  });

  return (
    <li ref={ref} className="bullet">
      <motion.span style={{ scale: scrollYProgress }}>Bullet</motion.span>
      {children}
    </li>
  );
};
