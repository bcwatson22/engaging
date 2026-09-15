import type { ReactNode } from 'react';

import { Copyright } from '@/components/atoms/Copyright/Copyright';
import { Toggle } from '@/components/atoms/Toggle/Toggle';
import { Nav } from '@/components/molecules/Nav/Nav';

type Props = {
  children: ReactNode;
};

const SiteLayout = ({ children }: Props) => (
  <div className="flex min-h-screen flex-col">
    <header className="flex justify-center p-6">
      <Nav />
    </header>
    {children}
    <footer className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 p-6">
      <Copyright />
      <Toggle className="print:hidden" />
    </footer>
  </div>
);

export default SiteLayout;
export type { Props as SiteLayoutProps };
