import { ReactNode } from "react";

type Props = {
  heading: string;
  children: ReactNode;
};

export const Section = ({ heading, children }: Props) => (
  <>
    {/* <article className="mt-12 grid grid-cols-3 items-start gap-6"> */}
    <div>
      <h2 className="divider">
        {heading}: <span>Divider</span>
      </h2>
    </div>
    <article className="flex flex-col gap-8">{children}</article>
    {/* </article> */}
  </>
);
