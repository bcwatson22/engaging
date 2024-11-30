import { useId } from "react";

import { Link } from "@/components/atoms/Link/Link";

const Reference = ({ person, role, company, link }: Reference) => {
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
