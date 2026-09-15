import type { Metadata } from 'next';

import { Transition } from '@/components/atoms/Transition/Transition';
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

const MotesPage = () => (
  <Transition>
    <main id="main" className="motes grow">
      <h1 className="sr-only">{title}</h1>
      <Motes />
    </main>
  </Transition>
);

export default MotesPage;
export { generateMetadata, viewport };
