import { Suspense } from "react";

import { Intro, TIntro } from "@/components/atoms/Intro/Intro";
import { Logo, TLogo } from "@/components/atoms/Logo/Logo";
import { SkeletonParagraph } from "@/components/atoms/Skeleton/Skeleton";

import { cacheCV } from "@/data/cache/cv";

type TProps = Pick<TMeta, "title"> & TLogo & TIntro;

const { logoDarkBackground, logoLightBackground } = cacheCV;

const HeaderSkeleton = () => (
  <div className="header">
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
}: TProps) => (
  <header className="header">
    <h1 className="sr-only">{title}</h1>
    <Logo
      logoDarkBackground={logoDarkBackground}
      logoLightBackground={logoLightBackground}
    />
    <div className="text-sm print:text-xs">
      <Suspense>
        <Intro intro={intro} />
      </Suspense>
    </div>
  </header>
);

export { Header, HeaderSkeleton };
export type { TProps as HeaderProps };
