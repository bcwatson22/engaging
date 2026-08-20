import { Suspense } from 'react';

import { Intro, type TIntro } from '@/components/atoms/Intro/Intro';
import { Logo, type TLogo } from '@/components/atoms/Logo/Logo';
import { SkeletonParagraph } from '@/components/atoms/Skeleton/Skeleton';
import { logoDarkBackground, logoLightBackground } from '@/constants/assets';

import { download, home, Nav } from '../Nav/Nav';

type Props = Pick<TMeta, 'title'> & TLogo & TIntro;

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
    <div className="text-sm text-pretty lg:row-span-2 print:text-xs">
      <Suspense>
        <Intro intro={intro} />
      </Suspense>
    </div>
    <Suspense>
      <Nav links={[home, download]} />
    </Suspense>
  </header>
);

export { Header, HeaderSkeleton };
export type { Props as HeaderProps };
