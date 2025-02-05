import Image from "next/image";

import type { TLink } from "@/components/atoms/Link/Link";
import { Skeleton } from "@/components/atoms/Skeleton/Skeleton";

type TTechnology = TID & {
  name: string;
  icon: TAsset;
  link?: TLink;
};

type Props = TTechnology;

const TechnologySkeleton = () => (
  <div className="technology p-3">
    <Skeleton className="logo rounded-full w-full h-full aspect-square opacity-100" />
  </div>
);

const split = "//";
const iconSize = 136;

const Technology = ({ id, icon, name }: Props) => {
  const splitNames = name.split(` ${split} `);
  const numOfSplitNames = splitNames.length;

  return (
    <div key={id} className="technology">
      <figure className="logo">
        {icon?.url && (
          <Image
            className={name === "Next" ? "white" : ""}
            src={icon.url}
            alt={`${name} logo`}
            width={iconSize}
            height={iconSize}
            sizes={`
              (min-width: 768px) 72px, 
              (min-width: 640px) calc(16.67vw - 1rem), 
              (min-width: 480px) calc(25vw - 2rem), 
              calc(33vw - 3rem)
            `}
            priority
          />
        )}
      </figure>
      <span className="name">
        {numOfSplitNames > 1
          ? splitNames.map((chunk, index) => (
              <span key={chunk.slice(0, 10)} className="chunk">
                {chunk}
                {index !== numOfSplitNames - 1 ? ` ${split}` : ""}
              </span>
            ))
          : name}
      </span>
    </div>
  );
};

export { Technology, TechnologySkeleton, iconSize };
export type { TTechnology, Props as TechnologyProps };
