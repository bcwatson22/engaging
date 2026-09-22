'use client';

import * as m from 'motion/react-m';
import { useRef } from 'react';

import { useScrollProgress } from '@/hooks/useScrollProgress/useScrollProgress';
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
  useScrollProgress({ ref, offset: ['end end', 'start center'] });
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
        {heading}: <span aria-hidden="true">Divider</span>
      </m.h2>
    </div>
  );
};

export { Divider };
export type { Props as DividerProps };
