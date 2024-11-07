import { useId } from "react";
import { Icon } from "../atoms/Icon";

const Reference = ({
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
      <a href={target} className="link icon">
        <Icon icon="Profile" />
        {text}
      </a>
    </section>
  );
};

export { Reference };
