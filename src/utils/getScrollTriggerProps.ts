import { AnimationProps, TargetAndTransition } from "framer-motion";

type Return = AnimationProps & {
  whileInView: TargetAndTransition;
  viewport: {
    once: boolean;
    margin: string;
  };
};

export const getScrollTriggerProps = (delay = 0, margin = "0px"): Return => ({
  initial: { opacity: 0, transform: "translateY(10px)" },
  whileInView: {
    opacity: 1,
    transform: "translateY(0)",
  },
  transition: { delay },
  viewport: { once: true, margin },
});
