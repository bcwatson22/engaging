import type { Metadata } from 'next';

import { Copyright } from '@/components/atoms/Copyright/Copyright';
import { Link } from '@/components/atoms/Link/Link';
import { Nav } from '@/components/molecules/Nav/Nav';
import { MotesDemo } from '@/components/organisms/MotesDemo/MotesDemo';
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
  <main className="motes main">
    <h1 className="sr-only">{title}</h1>
    <Nav className="flex justify-center" />
    <section className="intro">
      <h2>motes</h2>
      <p>
        A drifting particle field for a canvas, in 4.3KB gzipped. The simulation
        is written in Rust and compiled to WebAssembly; the drawing stays in
        TypeScript. It is what paints the background of this site.
      </p>
      <p className="links">
        <Link
          link={{
            target: 'https://www.npmjs.com/package/@bcwatson22/motes',
            text: 'npm',
            icon: 'Package',
          }}
        />
        <Link
          link={{
            target: 'https://github.com/bcwatson22/motes',
            text: 'Source',
            icon: 'Repo',
          }}
        />
      </p>
    </section>
    <MotesDemo />
    <footer className="footer">
      <Copyright />
    </footer>
  </main>
);

export default MotesPage;
export { generateMetadata, viewport };
