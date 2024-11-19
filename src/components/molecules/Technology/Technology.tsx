import { Skeleton } from "@/components/atoms/Skeleton";
import Image from "next/image";

type Props = {
  technology: Technology;
};

const TechnologySkeleton = () => (
  <div className="technology technology-skeleton">
    <Skeleton className="logo" />
  </div>
);

const Technology = ({ technology: { id, icon, name } }: Props) => (
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
    <span className="name">{name}</span>
  </div>
);

export { Technology, TechnologySkeleton };
export type { Props as TechnologyProps };
