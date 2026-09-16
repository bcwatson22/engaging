import type { Link } from '@/components/atoms/Link/Link';

import { List } from './List';

type Props = {
  className?: string;
  links?: Link[];
  label?: string;
};

const home: Link = {
  target: '/',
  text: 'Home',
  icon: 'Home',
};

const download: Link = {
  target: '/cv/download',
  text: 'Download',
  icon: 'Download',
};

const pdf: Link = {
  target: '/billy-watson-cv.pdf',
  text: 'PDF',
  icon: 'Document',
  newTab: true,
};

const cv: Link = {
  target: '/cv',
  text: 'CV',
  icon: 'Profile',
};

const contact: Link = {
  target: '/contact',
  text: 'Contact',
  icon: 'Pencil',
};

const motes: Link = {
  target: '/motes',
  text: 'Motes',
  icon: 'Sparkles',
};

const siteLinks: Link[] = [home, cv, contact, motes];

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
