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
    <nav className={`nav print:hidden${className ? ' ' + className : ''}`}>
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
