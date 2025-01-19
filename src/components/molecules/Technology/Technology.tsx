import Image from "next/image";

import type { TLink } from "@/components/atoms/Link/Link";
import { Skeleton } from "@/components/atoms/Skeleton/Skeleton";

type TTechnology = TID & {
  name: string;
  icon: TAsset;
  link?: TLink;
};

type Props = TTechnology;

const split = "//";

const TechnologySkeleton = () => (
  <div className="technology p-3">
    <Skeleton className="logo rounded-full w-full h-full aspect-square opacity-100" />
  </div>
);

const Technology = ({ id, icon, name }: Props) => (
  <div key={id} className="technology">
    <figure className="logo">
      {icon?.url && (
        <Image
          className={name === "Next" ? "white" : ""}
          src={icon.url}
          alt={`${name} logo`}
          width={256}
          height={256}
          priority
        />
      )}
    </figure>
    <span className="name">
      {name.includes(split)
        ? name.split(` ${split} `).map((chunk) => (
            <span key={chunk.slice(0, 5)} className="chunk" data-split={split}>
              {chunk}
            </span>
          ))
        : name}
    </span>
  </div>
);

export { Technology, TechnologySkeleton };
export type { TTechnology, Props as TechnologyProps };
