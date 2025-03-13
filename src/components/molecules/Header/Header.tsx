import { Suspense } from "react";

import { Intro, type TIntro } from "@/components/atoms/Intro/Intro";
import { Logo, type TLogo } from "@/components/atoms/Logo/Logo";
import { Link, type TLink } from "@/components/atoms/Link/Link";
import { SkeletonParagraph } from "@/components/atoms/Skeleton/Skeleton";

import { cacheCV } from "@/data/cache/cv";

type Props = Pick<TMeta, "title"> & TLogo & TIntro;

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

const links: TLink[] = [
  {
    target: "/",
    text: "Home",
    icon: "Home",
  },
  {
    target: "/cv/download",
    text: "Download",
    icon: "Download",
  },
];

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
    <div className="text-sm lg:row-span-2 print:text-xs">
      <Suspense>
        <Intro intro={intro} />
      </Suspense>
    </div>
    <nav className="nav print:hidden">
      <ul>
        {links.map((link) => (
          <li key={link?.target}>
            <Link link={link} />
          </li>
        ))}
      </ul>
    </nav>
  </header>
);

export { Header, HeaderSkeleton };
export type { Props as HeaderProps };
