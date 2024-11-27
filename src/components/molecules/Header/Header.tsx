import { Suspense } from "react";

import { Intro } from "@/components/atoms/Intro";
import { Logo } from "@/components/atoms/Logo";
import { SkeletonParagraph } from "@/components/atoms/Skeleton";

import { mockCV } from "@/data/cv";

type Props = Pick<
  CV,
  "title" | "logoDarkBackground" | "logoLightBackground" | "intro"
>;

const { logoDarkBackground, logoLightBackground } = mockCV;

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
}: Props) => (
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
);

export { Header, HeaderSkeleton };
