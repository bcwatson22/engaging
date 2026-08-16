import { type MotionProps, useInView } from 'motion/react';
import type { RefObject } from 'react';

type Params = TScroll & {
  ref: RefObject<HTMLDivElement | null>;
};

/* motion 13 dropped AnimationProps. These are the three props the hook
   actually returns, so name them rather than take the whole surface. */
type Return = Pick<MotionProps, 'initial' | 'animate' | 'transition'>;

const useScrollTrigger = ({
  ref,
  delay = 0,
  margin = '-20px',
}: Params): Return => {
  const isInView = useInView(ref, {
    once: true,
    amount: 'all',
    margin,
  });

  return {
    initial: { opacity: 0, y: '10px' },
    animate: isInView ? { opacity: 1, y: 0 } : {},
    transition: { delay },
  };
};

export { useScrollTrigger };
export type { Params };
