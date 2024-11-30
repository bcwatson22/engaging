import { Suspense, useId } from "react";

import { Dates } from "@/components/atoms/Dates/Dates";

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
      <Suspense>
        <Dates dates={dates} />
      </Suspense>
      <p className="mt-0">{description}</p>
    </section>
  );
};

export { Qualification };
