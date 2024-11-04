import { useId } from "react";
import { Dates } from "../atoms/Dates";

const Qualification = ({
  institution,
  location,
  dates,
  description,
}: Qualification) => {
  const sectionId = useId();

  return (
    <section aria-labelledby={sectionId} className="qualification">
      <h3>{institution}</h3>
      <Dates dates={dates} />
      <p className="mt-0">{description}</p>
    </section>
  );
};

export { Qualification };
