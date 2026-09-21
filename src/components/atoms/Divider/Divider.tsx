'use client';

import { useScroll } from 'motion/react';
import * as m from 'motion/react-m';
import { useRef } from 'react';

import { useScrollTrigger } from '@/hooks/useScrollTrigger/useScrollTrigger';

type Props = Scroll & {
  heading: string;
};

const Divider = ({
  heading,
  delay = 0,
  margin,
  amount,
  isImmediate,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['end end', 'start center'],
  });
  const triggerProps = useScrollTrigger({
    ref,
    delay,
    margin,
    amount,
    isImmediate,
  });

  return (
    <div ref={ref}>
      <m.h2 className="divider" {...triggerProps}>
        {heading}:{' '}
        <m.span style={{ scaleX: scrollYProgress }} aria-hidden="true">
          Divider
        </m.span>
      </m.h2>
    </div>
  );
};

export { Divider };
export type { Props as DividerProps };
