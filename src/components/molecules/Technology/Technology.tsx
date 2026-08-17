import Image from 'next/image';

import type { TLink } from '@/components/atoms/Link/Link';
import { Skeleton } from '@/components/atoms/Skeleton/Skeleton';
import { techIconDimensions } from '@/constants/dimensions';

type TTechnology = TID & {
  name: string;
  icon: TAsset;
  link?: TLink;
};

type Props = TTechnology;

const TechnologySkeleton = () => (
  <div className="technology p-3">
    <Skeleton className="logo aspect-square h-full w-full rounded-full opacity-100" />
  </div>
);

const { width, height } = techIconDimensions;
const split = '//';

const Technology = ({ id, icon, name }: Props) => {
  const splitNames = name.split(` ${split} `);
  const numOfSplitNames = splitNames.length;

  return (
    <div key={id} className="technology">
      <figure className="logo">
        {icon?.url && (
          <Image
            className={name === 'Next' ? 'white' : ''}
            src={icon.url}
            alt={`${name} logo`}
            width={width}
            height={height}
            /* No `sizes`, no preload and no `eager`, deliberately. These are
               twelve small icons and none of them is ever the LCP element, so
               preloading them only put twelve <link>s in the head to compete
               with the portrait that is — and React hoists a preload for any
               image it sees that isn't lazy, so `eager` here reintroduces
               exactly the links we are trying to remove. They sit in the
               viewport, which the browser loads immediately anyway.
               Dropping `sizes` also moves Next off the w-descriptor ladder
               onto 1x/2x candidates (144w and 280w, against a slot that is
               98px at its widest), which was most of the document's weight. */
            loading="lazy"
          />
        )}
      </figure>
      <span className="name">
        {numOfSplitNames > 1
          ? splitNames.map((chunk, index) => (
              <span key={chunk.slice(0, 10)} className="chunk">
                {chunk}
                {index !== numOfSplitNames - 1 ? ` ${split}` : ''}
              </span>
            ))
          : name}
      </span>
    </div>
  );
};

export { Technology, TechnologySkeleton };
export type { TTechnology, Props as TechnologyProps };
