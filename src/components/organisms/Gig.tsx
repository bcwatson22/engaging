import { Suspense, useId } from "react";
import { Dates } from "../atoms/Dates";
import { Bullet } from "../atoms/Bullet";
import { Company, CompanyProps } from "../molecules/Company";

type Props = Scroll & Gig;

const getRoleName = (
  index: number,
  total: number,
  hasMultiple = false
): string => {
  switch (true) {
    case !hasMultiple:
      return "";
    case index === 0:
      return " linker";
    case index < total:
      return " linker linkee";
    case index === total:
      return " linkee";
    default:
      return "";
  }
};

const Gig = ({ company, logo, city, roles, delay = 0 }: Props) => {
  const sectionId = useId();

  const companyProps: CompanyProps = {
    company,
    logo,
    city,
    sectionId,
    delay,
  };

  return (
    <section aria-labelledby={sectionId} className="gig">
      <Suspense>
        <Company {...companyProps} />
      </Suspense>
      {roles.map(({ id, role, dates, capacity, bullets }, index) => {
        const numOfRoles = roles.length;
        const hasMultiple = numOfRoles > 1;
        const className = getRoleName(index, numOfRoles - 1, hasMultiple);

        return (
          <div key={id} className={`role${className}`}>
            <h4
              className={`text-brand-blue dark:text-brand-yellow${
                hasMultiple ? " multiple" : ""
              }`}
            >
              {role}
            </h4>
            <div className="flex">
              <Dates dates={dates} className="mb-4" />
              <p className="capacity">{capacity}</p>
            </div>
            <ul className="bullets">
              {bullets.map((content) => (
                <Suspense key={content.slice(0, 15)}>
                  <Bullet>{content}</Bullet>
                </Suspense>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
};

export { Gig };
