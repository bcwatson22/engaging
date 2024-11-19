// "use client";

import { useId } from "react";
import Image from "next/image";

import { Link } from "@/components/atoms/Link";
import {
  Technology,
  TechnologySkeleton,
} from "@/components/molecules/Technology";
import { Skeleton } from "@/components/atoms/Skeleton";

type Props = {
  mugshot: Mugshot;
  technologies: Technology[];
};

const MugshotSkeleton = () => (
  <div className="mugshot mugshot-skeleton">
    <Skeleton className="overview" />
    <ul className="technologies">
      {Array(12)
        .keys()
        .map((key) => (
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

  // const [isLoading, setIsLoading] = useState<boolean>(true);

  return (
    // <>
    //   {isLoading ? (
    //     <MugshotSkeleton />
    //   ) : (
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
    //   )}
    //   <button
    //     className="absolute top-4 left-4"
    //     onClick={() => setIsLoading(!isLoading)}
    //   >
    //     Toggle
    //   </button>
    // </>
  );
};

export { Mugshot, MugshotSkeleton };
export type { Props as MugshotProps };
