import Image from 'next/image';

import type { TLink } from '@/components/atoms/Link/Link';
import { Skeleton } from '@/components/atoms/Skeleton/Skeleton';
import { Details } from '@/components/molecules/Details/Details';
import {
  Technology,
  TechnologySkeleton,
  type TTechnology,
} from '@/components/molecules/Technology/Technology';
import { mugshotDimensions } from '@/constants/dimensions';

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

/* This is what the browser paints first: `loading.tsx` is flushed as the
   shell of the streamed prerender, and React swaps the real page in over the
   top of it once the document has parsed. Any geometry that differs between
   the two is a layout shift, so the wrapper has to be the element the real
   Mugshot uses, with the same classes — `w-full` here rather than there was
   worth ~0.18 CLS on its own, because `.technologies` is positioned against
   this box at md and up, and `md:items-center` shrinks the real one to its
   content width while the skeleton stretched to the full column. */
const MugshotSkeleton = () => (
  <article className="mugshot">
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

const Mugshot = ({
  mugshot: { heading, description, image, links },
  technologies,
}: Props) => (
  <article className="mugshot">
    <section aria-labelledby={sectionId} className="overview">
      <figure className="coupon">
        <Image
          src={image.url}
          alt={`Portrait of ${heading}`}
          width={width}
          height={height}
          /* `100vw` and not the truer `calc(100vw - 3rem)`: Next only reads
               a vw figure that follows whitespace or the start of the string
               (see getWidths in next/dist/shared/lib/get-img-props), so the
               calc() form matched nothing and fell back to emitting every
               width it knows — a 16-candidate srcset, in a preload, in the
               document. Overstating the slot by the 3rem gutter costs at most
               one step up on narrow screens. */
          sizes={`(min-width: 480px) ${width}px, 100vw`}
          /* The LCP element. `preload` replaces the deprecated `priority`
               in Next 16, and fetchPriority rides along onto the preload link
               — which is the bit Lighthouse was asking for. */
          preload
          fetchPriority="high"
          loading="eager"
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

export { Mugshot, MugshotSkeleton };
export type { TMugshot, Props as MugshotProps };
