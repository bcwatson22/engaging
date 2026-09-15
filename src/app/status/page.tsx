import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Particles } from '@/components/atoms/Particles/Particles';
import { Transition } from '@/components/atoms/Transition/Transition';
import { Status } from '@/components/organisms/Status/Status';
import { metadata as shared, viewport } from '@/constants/metadata';
import { getStatus } from '@/data/functions/getStatus';

const title = 'Status — Engaging Engineering';
const description =
  'What the render service behind this site last produced, and what is in its queue.';

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
  robots: {
    index: false,
    follow: true,
  },
});

const StatusPage = async () => {
  const status = await getStatus();

  return (
    <Transition>
      <main id="main" className="status grow">
        <h1 className="sr-only">{title}</h1>
        <Suspense>
          <Particles
            color="var(--brand-blue)"
            colorDark="var(--brand-light)"
            opacity={0.35}
            opacityDark={0.2}
          />
        </Suspense>
        <Status status={status} />
      </main>
    </Transition>
  );
};

export default StatusPage;
export { generateMetadata, viewport, title, description };

export const revalidate = 60;
