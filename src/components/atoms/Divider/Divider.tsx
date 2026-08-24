'use client';

import { m, useScroll } from 'motion/react';
import { useRef } from 'react';

import { useScrollTrigger } from '@/hooks/useScrollTrigger/useScrollTrigger';

type Props = TScroll & {
  heading: string;
};

const Divider = ({ heading, delay = 0 }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['end end', 'start center'],
  });
  const triggerProps = useScrollTrigger({ ref, delay });

  return (
    <div ref={ref}>
      <m.h2 className="divider" {...triggerProps}>
        {heading}: <m.span style={{ scaleX: scrollYProgress }}>Divider</m.span>
      </m.h2>
    </div>
  );
};

export { Divider };
export type { Props as DividerProps };
