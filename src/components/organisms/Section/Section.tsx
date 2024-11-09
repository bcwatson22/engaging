import { ReactNode, Suspense } from "react";
import { Divider, DividerProps } from "@/components/atoms/Divider";

type Props = DividerProps & {
  children: ReactNode;
  className?: string;
};

const Section = ({ heading, children, className, delay = 0 }: Props) => (
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
