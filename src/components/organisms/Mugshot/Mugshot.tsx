import Image from 'next/image';

import type { Link } from '@/components/atoms/Link/Link';
import { Skeleton, SkeletonStatus } from '@/components/atoms/Skeleton/Skeleton';
import { Details } from '@/components/molecules/Details/Details';
import {
  Technology,
  TechnologySkeleton,
} from '@/components/molecules/Technology/Technology';
import { mugshotDimensions } from '@/constants/dimensions';

import { Reveal } from './Reveal';
import { Technologies } from './Technologies';

type Mugshot = ID & {
  image: Asset;
  heading: string;
  description: string;
  links?: Link[];
};

type Props = {
  mugshot: Mugshot;
  technologies: Technology[];
};

const MugshotSkeleton = () => (
  <article className="mugshot">
    <SkeletonStatus />
    <Skeleton className="overview rounded-full" />
    <ul className="technologies loading">
      {[...Array(12).keys()].map((key) => (
        <li key={key}>
          <TechnologySkeleton />
        </li>
      ))}
    </ul>
  </article>
);

const { width, height } = mugshotDimensions;

const sectionId = 'mugshot';
const infoId = 'mugshot-info';

const Mugshot = ({
  mugshot: { heading, description, image, links },
  technologies,
}: Props) => (
  <article className="mugshot">
    <Reveal labelledBy={sectionId} controls={infoId}>
      <figure className="coupon">
        <Image
          src={image.url}
          alt={`Portrait of ${heading}`}
          width={width}
          height={height}
          sizes={`(min-width: 480px) ${width}px, 100vw`}
          preload
          fetchPriority="high"
          loading="eager"
        />
      </figure>
      <div id={infoId} className="info">
        <h2 id={sectionId}>{heading}</h2>
        <p>{description}</p>
        {links && <Details links={links} />}
      </div>
    </Reveal>
    <Technologies>
      {technologies.map((technology) => (
        <li key={technology.id}>
          <Technology {...technology} />
        </li>
      ))}
    </Technologies>
  </article>
);

export { Mugshot, MugshotSkeleton };
export type { Props as MugshotProps };
