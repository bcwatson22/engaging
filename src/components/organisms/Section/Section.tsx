import { type ReactNode, Suspense } from 'react';

import { Divider, type DividerProps } from '@/components/atoms/Divider/Divider';

type Props = DividerProps & {
  children: ReactNode;
  className?: string;
};

const Section = ({
  heading,
  children,
  className,
  delay = 0,
  margin,
  amount,
  isImmediate,
}: Props) => (
  <>
    <Suspense>
      <Divider
        heading={heading}
        delay={delay}
        margin={margin}
        amount={amount}
        isImmediate={isImmediate}
      />
    </Suspense>
    <article className={`section${className ? ' ' + className : ''}`}>
      {children}
    </article>
  </>
);

export { Section };
export type { Props as SectionProps };
