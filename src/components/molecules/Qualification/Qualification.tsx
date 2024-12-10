import { Suspense, useId } from "react";

import { Dates } from "@/components/atoms/Dates/Dates";

type TQualification = TID & {
  institution: string;
  location: string;
  dates: string[];
  description: string;
};

type TProps = TQualification;

const Qualification = ({ institution, dates, description }: TProps) => {
  const sectionId = useId();

  return (
    <section aria-labelledby={sectionId} className="qualification">
      <h3 id={sectionId}>{institution}</h3>
      <Suspense>
        <Dates dates={dates} />
      </Suspense>
      <p className="mt-0">{description}</p>
    </section>
  );
};

export { Qualification };
export type { TQualification, TProps as QualificationProps };
