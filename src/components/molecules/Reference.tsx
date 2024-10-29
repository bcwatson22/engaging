import { useId } from "react";
import { Dates } from "../atoms/Dates";

export const Reference = ({
  person,
  role,
  company,
  link: { text, target },
}: Reference) => {
  const sectionId = useId();

  return (
    <section aria-labelledby={sectionId} className="qualification">
      <h3>{person}</h3>
      <p className="mt-0">
        {role}, {company}
      </p>
      <a href={target} className="link">
        {text}
      </a>
    </section>
  );
};
