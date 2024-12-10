import { useId } from "react";

import { Link, type TLink } from "@/components/atoms/Link/Link";

type TReference = TID &
  TPosition & {
    person: string;
    link: TLink;
  };

const Reference = ({ person, role, company, link }: TReference) => {
  const sectionId = useId();

  return (
    <section aria-labelledby={sectionId} className="qualification">
      <h3>{person}</h3>
      <p className="mt-0">
        {role}, {company}
      </p>
      <Link link={link} />
    </section>
  );
};

export { Reference };
export type { TReference };
