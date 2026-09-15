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
            alt=""
            width={width}
            height={height}
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
