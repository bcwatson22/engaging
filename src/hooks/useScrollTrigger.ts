import { type AnimationProps, useInView } from "framer-motion";
import { type RefObject } from "react";

type Params = TScroll & {
  ref: RefObject<HTMLDivElement>;
};

type Return = AnimationProps;

const useScrollTrigger = ({
  ref,
  delay = 0,
  margin = "-20px",
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

export { useScrollTrigger };
export type { Params };
