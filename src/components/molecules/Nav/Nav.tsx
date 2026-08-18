import { Link, type TLink } from '@/components/atoms/Link/Link';

type Props = {
  className?: string;
  hasDownload?: boolean;
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

const Nav = ({ hasDownload = false, className }: Props) => {
  const links: TLink[] = [home, ...(hasDownload ? [download] : [cv, contact])];

  return (
    /* Built from discrete strings, not a template literal. Tailwind finds
       classes by scanning source text for candidate tokens, and
       `print:hidden${className...}` gave it no boundary to stop at — so it
       read `print:hidden${className`, matched no utility, and generated no
       rule. The class shipped in the HTML with nothing behind it, and the nav
       appeared in the printed CV. */
    <nav
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
};

export { Nav };
