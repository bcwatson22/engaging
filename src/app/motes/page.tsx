import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Particles } from '@/components/atoms/Particles/Particles';
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
      <Suspense>
        <Particles
          color="var(--brand-blue)"
          colorDark="var(--brand-light)"
          opacity={0.55}
          opacityDark={0.3}
        />
      </Suspense>
      <Motes />
    </main>
  </Transition>
);

export default MotesPage;
export { generateMetadata, viewport };
