import { type MotionProps, useInView } from 'motion/react';
import type { RefObject } from 'react';

type Params = Scroll & {
  ref: RefObject<HTMLDivElement | null>;
};

/* motion 13 dropped AnimationProps. These are the three props the hook
   actually returns, so name them rather than take the whole surface. */
type Return = Pick<MotionProps, 'initial' | 'animate' | 'transition'>;

/* isImmediate animates on mount instead of waiting to be seen, for what is
   on screen when the page loads. Waiting there is only a way to miss it: how
   far down the first item starts depends on everything above it, so a change
   higher up the page (the CV gaining the site nav) can leave it straddling the
   fold, and then it never counts as wholly in view until someone scrolls.

   amount is how much of the element has to be in view. 'all' suits most
   things, but not a sticky element: it can stick inside the negative margin,
   so it may never be wholly within the shrunk viewport, and once passed it
   stays invisible. */
const useScrollTrigger = ({
  ref,
  delay = 0,
  margin = '-20px',
  amount = 'all',
  isImmediate = false,
}: Params): Return => {
  const isInView = useInView(ref, {
    once: true,
    amount,
    margin,
  });

  return {
    initial: { opacity: 0, y: '10px' },
    animate: isImmediate || isInView ? { opacity: 1, y: 0 } : {},
    transition: { delay },
  };
};

export { useScrollTrigger };
export type { Params };
