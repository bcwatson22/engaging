import type { Metadata } from 'next';

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
  /* Nothing here is worth a search result — it is a page about plumbing, and
     it changes every minute. */
  robots: {
    index: false,
    follow: true,
  },
});

const StatusPage = async () => {
  const status = await getStatus();

  return (
    <main className="status grow">
      <h1 className="sr-only">{title}</h1>
      <Status status={status} />
    </main>
  );
};

export default StatusPage;
export { generateMetadata, viewport, title, description };

/* Next parses route segment config statically, so this has to be a plain
   numeric literal — it cannot import the same constant getStatus uses. One
   minute, matching the endpoint's own cache-control. */
export const revalidate = 60;
