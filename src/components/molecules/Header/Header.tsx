import { Suspense } from 'react';

import { Intro, type TIntro } from '@/components/atoms/Intro/Intro';
import { Logo, type TLogo } from '@/components/atoms/Logo/Logo';
import { SkeletonLine } from '@/components/atoms/Skeleton/Skeleton';
import { logoDarkBackground, logoLightBackground } from '@/constants/assets';

import { download, Nav, pdf } from '../Nav/Nav';

type Props = Pick<TMeta, 'title'> & TLogo & TIntro;

const whereFourLines = 'sm:max-md:hidden lg:hidden';
const whereFiveLines = 'xs:max-md:hidden min-[880px]:hidden';

const introParagraphs: { width: string; visibility?: string }[][] = [
  [
    { width: 'w-11/12' },
    { width: 'w-full' },
    { width: 'w-[95%]' },
    { width: 'w-11/12', visibility: whereFourLines },
    { width: 'w-4/5', visibility: whereFiveLines },
  ],
  [
    { width: 'w-[95%]' },
    { width: 'w-full' },
    { width: 'w-2/3' },
    { width: 'w-1/3', visibility: whereFiveLines },
  ],
];

const HeaderSkeleton = () => (
  <div className="header">
    <h1 className="sr-only">Billy Watson</h1>
    <Logo
      logoDarkBackground={logoDarkBackground}
      logoLightBackground={logoLightBackground}
    />
    <div className="flex flex-col gap-2 md:gap-4 lg:row-span-2">
      {introParagraphs.map((lines, paragraph) => (
        <div key={paragraph}>
          {lines.map(({ width, visibility }, line) => (
            <div
              key={line}
              className={`flex h-5 items-center${visibility ? ` ${visibility}` : ''}`}
            >
              <SkeletonLine size="small" className={width} />
            </div>
          ))}
        </div>
      ))}
    </div>
    <Nav links={[pdf, download]} label="CV" />
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
      <Nav links={[pdf, download]} label="CV" />
    </Suspense>
  </header>
);

export { Header, HeaderSkeleton };
export type { Props as HeaderProps };
