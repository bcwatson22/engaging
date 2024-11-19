"use client";

import { Suspense, useState } from "react";
import { Intro } from "@/components/atoms/Intro";
import { Logo } from "@/components/atoms/Logo";
import { mockCv } from "@/mocks/cv";
import { SkeletonParagraph } from "@/components/atoms/Skeleton";

type Props = Pick<
  CV,
  "title" | "logoDarkBackground" | "logoLightBackground" | "intro"
>;

const { logoDarkBackground, logoLightBackground } = mockCv;

const HeaderSkeleton = () => (
  <div className="header header-skeleton">
    <h1 className="sr-only">Billy Watson</h1>
    <Logo
      logoDarkBackground={logoDarkBackground}
      logoLightBackground={logoLightBackground}
    />
    <div>
      <SkeletonParagraph size="small" />
    </div>
  </div>
);

const Header = ({
  title,
  logoDarkBackground,
  logoLightBackground,
  intro,
}: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  return (
    <>
      {isLoading ? (
        <HeaderSkeleton />
      ) : (
        <header className="header">
          <h1 className="sr-only">{title}</h1>
          <Logo
            logoDarkBackground={logoDarkBackground}
            logoLightBackground={logoLightBackground}
          />
          <div>
            <Suspense>
              <Intro intro={intro} />
            </Suspense>
          </div>
        </header>
      )}
      <button
        className="absolute top-4 left-4"
        onClick={() => setIsLoading(!isLoading)}
      >
        Toggle
      </button>
    </>
  );
};

export { Header };
