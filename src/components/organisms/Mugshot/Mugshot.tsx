import { useId } from "react";
import Image from "next/image";

import type { TLink } from "@/components/atoms/Link/Link";
import { Skeleton } from "@/components/atoms/Skeleton/Skeleton";

import { Details } from "@/components/molecules/Details/Details";
import {
  Technology,
  TechnologySkeleton,
  type TTechnology,
} from "@/components/molecules/Technology/Technology";
import { mugshotDimensions } from "@/constants/dimensions";

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
    <ul className="technologies loading">
      {[...Array(12).keys()].map((key) => (
        <li key={key}>
          <TechnologySkeleton />
        </li>
      ))}
    </ul>
  </div>
);

const { width, height } = mugshotDimensions;

const Mugshot = ({
  mugshot: { heading, description, image, links },
  technologies,
}: Props) => {
  const sectionId = useId();

  return (
    <article className="mugshot">
      <section aria-labelledby={sectionId} className="overview">
        <figure className="coupon">
          <Image
            src={image.url}
            alt={`Portrait of ${heading}`}
            width={width}
            height={height}
            sizes={`
              (min-width: 480px) ${width}px, 
              calc(100vw - 3rem)
            `}
            priority
          />
        </figure>
        <div className="info">
          <h2 id={sectionId}>{heading}</h2>
          <p>{description}</p>
          {links && <Details links={links} />}
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
