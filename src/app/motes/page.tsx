import type { Metadata } from 'next';

import { Copyright } from '@/components/atoms/Copyright/Copyright';
import type { TLink } from '@/components/atoms/Link/Link';
import { home, Nav } from '@/components/molecules/Nav/Nav';
import { Motes } from '@/components/organisms/Motes/Motes';
import { metadata as shared, viewport } from '@/constants/metadata';

/* Where the package lives, rather than where the site does. Home stays, so
   there is still a way back out of the demo. */
const links: TLink[] = [
  home,
  {
    target: 'https://www.npmjs.com/package/@bcwatson22/motes',
    text: 'npm',
    icon: 'Package',
  },
  {
    target: 'https://github.com/bcwatson22/motes',
    text: 'Docs',
    icon: 'Lightbulb',
  },
];

const title = 'Motes | Engaging Engineering';
const description =
  'An interactive demo of motes, a 4KB WebAssembly particle field with its simulation written in Rust.';

const generateMetadata = (): Metadata => ({
  title,
  description,
  ...shared,
  openGraph: {
    ...shared.openGraph,
    title,
    description,
  },
  twitter: {
    ...shared.twitter,
    title,
    description,
  },
});

/* No Particles component here, unlike every other page. The demo owns a canvas
   of its own, and a background field behind it would be two fields arguing
   over the same pointer. */
const MotesPage = () => (
  <main className="motes main">
    <h1 className="sr-only">{title}</h1>
    <Nav links={links} className="flex justify-center" />
    <Motes />
    <footer className="footer">
      <Copyright />
    </footer>
  </main>
);

export default MotesPage;
export { generateMetadata, viewport };
