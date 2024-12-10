import { ReactNode, Suspense } from "react";

import { Divider, DividerProps } from "@/components/atoms/Divider/Divider";

type TProps = DividerProps & {
  children: ReactNode;
  className?: string;
};

const Section = ({ heading, children, className, delay = 0 }: TProps) => (
  <>
    <Suspense>
      <Divider heading={heading} delay={delay} />
    </Suspense>
    <article className={`section${className ? " " + className : ""}`}>
      {children}
    </article>
  </>
);

export { Section };
export type { TProps as SectionProps };
