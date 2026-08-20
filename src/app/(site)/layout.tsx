import type { ReactNode } from 'react';

import { Copyright } from '@/components/atoms/Copyright/Copyright';
import { Nav } from '@/components/molecules/Nav/Nav';

type Props = {
  children: ReactNode;
};

/* Everything but the CV. The CV is deliberately outside this group: it carries
   its own header, with a link to the PDF rather than to the rest of the site,
   which is the case route groups exist for.

   The full-height column lives here rather than on each page's main, because
   the nav and the footer sit either side of main now. Left on main, every page
   would come to a viewport plus a nav and scroll by exactly that much. */
const SiteLayout = ({ children }: Props) => (
  <div className="flex min-h-screen flex-col">
    {/* header and footer, rather than a bare nav and a div, because both are
        landmarks only when they sit outside main — nesting either inside it
        disqualifies them. This is what makes the page navigable by landmark:
        banner, main, contentinfo. */}
    <header>
      <Nav className="flex justify-center" />
    </header>
    {children}
    <footer className="footer">
      <Copyright />
    </footer>
  </div>
);

export default SiteLayout;
export type { Props as SiteLayoutProps };
