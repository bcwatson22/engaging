import { useId, type ReactNode } from "react";
import Image from "next/image";

import { Link, type TLink } from "@/components/atoms/Link/Link";
import {
  Technology,
  TechnologySkeleton,
  type TTechnology,
} from "@/components/molecules/Technology/Technology";
import { Skeleton } from "@/components/atoms/Skeleton/Skeleton";

type TMugshot = TID & {
  image: TAsset;
  heading: string;
  description: string;
  links?: TLink[];
};

type Props = {
  mugshot: TMugshot;
  technologies: TTechnology[];
};

const MugshotSkeleton = () => (
  <div className="mugshot w-full">
    <Skeleton className="overview rounded-full" />
    <ul className="technologies">
      {[...Array(12).keys()].map((key) => (
        <li key={key}>
          <TechnologySkeleton />
        </li>
      ))}
    </ul>
  </div>
);

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
                <li key={link?.id}>
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
            <Technology {...technology} />
          </li>
        ))}
      </ul>
    </article>
  );
};

export { Mugshot, MugshotSkeleton };
export type { TMugshot, Props as MugshotProps };
