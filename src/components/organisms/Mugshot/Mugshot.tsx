import { useId } from "react";
import Image from "next/image";

import { Link } from "@/components/atoms/Link";
import { Technology } from "@/components/molecules/Technology/Technology";

type Props = {
  mugshot: Mugshot;
  technologies: Technology[];
};

const Mugshot = ({
  mugshot: { heading, description, image, links },
  technologies,
}: Props) => {
  const sectionId = useId();

  return (
    <article className="mugshot">
      <section aria-labelledby={sectionId} className="overview">
        {image?.url && (
          <figure className="coupon">
            <Image
              src={image.url}
              alt={`Portrait of ${heading}`}
              width={600}
              height={600}
              priority
            />
          </figure>
        )}
        <div className="info">
          <h2 id={sectionId}>{heading}</h2>
          <p>{description}</p>
          {links && (
            <ul className="links">
              {links.map((link) => (
                <li key={link.id}>
                  <Link link={link} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <ul className="technologies">
        {technologies.map((technology) => (
          <li key={technology.id}>
            <Technology key={technology.id} technology={technology} />
          </li>
        ))}
      </ul>
    </article>
  );
};

export { Mugshot };
export type { Props as MugshotProps };
