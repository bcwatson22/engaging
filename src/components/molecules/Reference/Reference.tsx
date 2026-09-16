import { useId } from 'react';

import { Link } from '@/components/atoms/Link/Link';

type Reference = ID &
  Position & {
    person: string;
    link: Link;
  };

type Props = Reference;

const Reference = ({ person, role, company, link }: Props) => {
  const sectionId = useId();

  return (
    <section aria-labelledby={sectionId} className="qualification reference">
      <h3 id={sectionId}>{person}</h3>
      <p className="mt-0">
        {role}, {company}
      </p>
      <Link link={link} />
    </section>
  );
};

export { Reference };
export type { Props as ReferenceProps };
