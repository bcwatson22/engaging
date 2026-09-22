import { useMotionValueEvent, useScroll } from 'motion/react';
import type { RefObject } from 'react';

type Offset = NonNullable<Parameters<typeof useScroll>[0]>['offset'];

type Params = {
  ref: RefObject<HTMLElement | null>;
  offset: Offset;
};

const property = '--progress';

/* Writes the target's scroll progress to a custom property for CSS to use,
   rather than handing the motion value to an m. element's style.

   An m. element can only draw once LazyMotion's features have loaded, which is
   after hydration. The first measure sets progress from 0 to wherever the
   target already sits, and when that landed before the features the element
   never drew it: a motion value only notifies on a change, and nothing changed
   again until the page was scrolled. So on a cold load everything already on
   screen stayed at 0. This subscription is live from the first commit, so it
   hears that first change whenever the features arrive. */
const useScrollProgress = ({ ref, offset }: Params): void => {
  const { scrollYProgress } = useScroll({ target: ref, offset });

  useMotionValueEvent(scrollYProgress, 'change', (progress: number): void => {
    ref.current?.style.setProperty(property, String(progress));
  });
};

export { useScrollProgress, property };
export type { Params };
