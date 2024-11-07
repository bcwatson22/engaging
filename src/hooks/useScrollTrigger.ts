"use client";

import { AnimationProps, useInView } from "framer-motion";
import { RefObject } from "react";

type Params = Scroll & {
  ref: RefObject<HTMLDivElement>;
};

type Return = AnimationProps;

export const useScrollTrigger = ({
  ref,
  delay = 0,
  margin = "-60px",
}: Params): Return => {
  const isInView = useInView(ref, {
    once: true,
    amount: "all",
    margin,
  });

  return {
    initial: { opacity: 0, y: "10px" },
    animate: isInView ? { opacity: 1, y: 0 } : {},
    transition: { delay },
  };
};
