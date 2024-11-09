"use client";

import { useScroll, motion } from "framer-motion";
import { ReactNode, useRef } from "react";

type Props = {
  children: ReactNode;
};

const Bullet = ({ children }: Props) => {
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["end end", "start 80vh"],
  });

  return (
    <li ref={ref} className="bullet">
      <motion.span style={{ scale: scrollYProgress }}>Bullet</motion.span>
      {children}
    </li>
  );
};

export { Bullet };
