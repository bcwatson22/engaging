import type { Metadata } from 'next';

import { Copyright } from '@/components/atoms/Copyright/Copyright';
import { Motes } from '@/components/organisms/Motes/Motes';
import { metadata as shared, viewport } from '@/constants/metadata';

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
  <main className="motes grow">
    <h1 className="sr-only">{title}</h1>
    <Motes />
    <footer className="footer">
      <Copyright />
    </footer>
  </main>
);

export default MotesPage;
export { generateMetadata, viewport };
