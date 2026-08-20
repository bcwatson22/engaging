import type { ReactNode } from 'react';

import { Nav } from '@/components/molecules/Nav/Nav';

type Props = {
  children: ReactNode;
};

/* Everything but the CV. The CV is deliberately outside this group: it carries
   its own header, with a link to the PDF instead of to the rest of the site.

   The full-height column lives here rather than on each page's main, because
   the nav sits above main now. Left on main, every page would come to a
   viewport plus a nav and scroll by exactly the height of the nav. */
const SiteLayout = ({ children }: Props) => (
  <div className="flex min-h-screen flex-col">
    {/* Outside main, which is where a nav repeated on every page belongs —
        main is for what is unique to the page. */}
    <Nav className="flex justify-center" />
    {children}
  </div>
);

export default SiteLayout;
export type { Props as SiteLayoutProps };
