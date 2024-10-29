import { useId } from "react";
import { Dates } from "../atoms/Dates";
import { Bullet } from "../atoms/Bullet";
import { Company } from "../molecules/Company";

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

export const Gig = ({ company, logo, city, roles, delay = 0 }: Props) => {
  const sectionId = useId();

  return (
    <section aria-labelledby={sectionId} className="gig">
      <Company
        company={company}
        logo={logo}
        city={city}
        sectionId={sectionId}
        delay={delay}
      />
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
                <Bullet key={content.slice(0, 15)}>{content}</Bullet>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
};
