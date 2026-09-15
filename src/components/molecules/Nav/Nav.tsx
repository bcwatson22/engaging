import type { TLink } from '@/components/atoms/Link/Link';

import { List } from './List';

type Props = {
  className?: string;
  links?: TLink[];
  label?: string;
};

const home: TLink = {
  target: '/',
  text: 'Home',
  icon: 'Home',
};

const download: TLink = {
  target: '/cv/download',
  text: 'Download',
  icon: 'Download',
};

const pdf: TLink = {
  target: '/billy-watson-cv.pdf',
  text: 'PDF',
  icon: 'Document',
  newTab: true,
};

const cv: TLink = {
  target: '/cv',
  text: 'CV',
  icon: 'Profile',
};

const contact: TLink = {
  target: '/contact',
  text: 'Contact',
  icon: 'Pencil',
};

const motes: TLink = {
  target: '/motes',
  text: 'Motes',
  icon: 'Sparkles',
};

const siteLinks: TLink[] = [home, cv, contact, motes];

const Nav = ({ links = siteLinks, label = 'Site', className }: Props) => {
  const isSite = links === siteLinks;

  return (
    <nav
      aria-label={label}
      className={[isSite ? 'site-nav' : 'nav', 'print:hidden', className]
        .filter(Boolean)
        .join(' ')}
    >
      <List links={links} expand={isSite} />
    </nav>
  );
};

export { contact, cv, download, home, motes, Nav, pdf, siteLinks };
