import { Link, type TLink } from '@/components/atoms/Link/Link';

type Props = {
  className?: string;
  /* The site's own pages by default. A page with a second nav — the CV's
     download, the demo's package links — passes its own, composed from the
     exports below. */
  links?: TLink[];
  /* What a screen reader calls this one. Two navs on a page are
     indistinguishable without it: both are announced as "navigation" and
     neither says which. */
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

const cv: TLink = {
  target: '/cv',
  text: 'CV',
  icon: 'Document',
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

const Nav = ({ links = siteLinks, label = 'Site', className }: Props) => (
  /* Built from discrete strings, not a template literal. Tailwind finds
       classes by scanning source text for candidate tokens, and
       `print:hidden${className...}` gave it no boundary to stop at — so it
       read `print:hidden${className`, matched no utility, and generated no
       rule. The class shipped in the HTML with nothing behind it, and the nav
       appeared in the printed CV. */
  <nav
    aria-label={label}
    className={['nav', 'print:hidden', className].filter(Boolean).join(' ')}
  >
    <ul>
      {links.map((link) => (
        <li key={link?.target}>
          <Link link={link} />
        </li>
      ))}
    </ul>
  </nav>
);

export { contact, cv, download, home, motes, Nav, siteLinks };
