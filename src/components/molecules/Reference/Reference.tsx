import { useId } from "react";

import { Link, type TLink } from "@/components/atoms/Link/Link";

type TReference = TID &
  TPosition & {
    person: string;
    link: TLink;
  };

type TProps = TReference;

const Reference = ({ person, role, company, link }: TProps) => {
  const sectionId = useId();

  return (
    <section aria-labelledby={sectionId} className="qualification">
      <h3 id={sectionId}>{person}</h3>
      <p className="mt-0">
        {role}, {company}
      </p>
      <Link link={link} />
    </section>
  );
};

export { Reference };
export type { TReference, TProps as ReferenceProps };
