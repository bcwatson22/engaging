import { Suspense, useId } from "react";

import { Dates } from "@/components/atoms/Dates/Dates";

type TQualification = TID & {
  institution: string;
  location: string;
  dates: string[];
  description: string;
};

const Qualification = ({ institution, dates, description }: TQualification) => {
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
export type { TQualification };
