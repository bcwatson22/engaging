"use client";

import { useId, type ReactNode } from "react";
import Image from "next/image";

import { cacheHome } from "@/data/cache/home";

import { Inner } from "@/components/atoms/Link/Link";
import { Particles } from "@/components/atoms/Particles/Particles";
import { TechnologySkeleton } from "@/components/molecules/Technology/Technology";
import { type TMugshot } from "@/components/organisms/Mugshot/Mugshot";

type Props = {
  heading?: string;
  children?: ReactNode;
  content?: TMugshot;
  reset?: () => void;
};

const Error = ({
  heading = "Oops",
  children,
  content = cacheHome.mugshot,
  reset,
}: Props) => {
  const sectionId = useId();

  const { image, heading: name } = content;

  return (
    <main className="home main">
      <h1 className="sr-only">Engaging Engineering</h1>
      <section aria-labelledby={sectionId} className="overview overview-error">
        <figure className="coupon">
          <Image
            src={image.url}
            alt={`Portrait of ${name}`}
            width={600}
            height={600}
            className="opacity-30"
            priority
          />
        </figure>
        <div className="info opacity-100 z-20">
          <h2 id={sectionId}>{heading}</h2>
          {children ? (
            children
          ) : (
            <p>
              Something went wrong, but believe it or not you&apos;re not
              actually reading this, so it&apos;s all ok.
            </p>
          )}
          {reset && (
            <button onClick={reset} className="link icon mt-4">
              <Inner text="Try again" icon="Retry" />
            </button>
          )}
        </div>
        <ul className="technologies technologies-error hidden md:grid">
          {[...Array(12).keys()].map((key) => (
            <li key={key}>
              <TechnologySkeleton />
            </li>
          ))}
        </ul>
      </section>
      <Particles />
    </main>
  );
};

export { Error };
export type { Props as ErrorProps };
