import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Particles } from '@/components/atoms/Particles/Particles';
import { Mugshot } from '@/components/organisms/Mugshot/Mugshot';
import { appleWebApp, metadata, viewport } from '@/constants/metadata';
import { getStartupImages } from '@/constants/startupImages';
import { getData } from '@/data/functions/getData';
import { snapshotHome } from '@/data/snapshot/snapshot';
import type { THome } from '@/data/types/home';
import { queryHome } from '@/queries/home';
import { formatExperience } from '@/utils/formatExperience';

const pageNameLower = 'home';
const pageNamePlural = 'homes';

const generateMetadata = async (): Promise<Metadata> => {
  const {
    meta: { title, description, keywords },
  } = await getData<THome>(queryHome, pageNamePlural, snapshotHome);

  const formattedDescription = formatExperience(description);

  return {
    title,
    description: formattedDescription,
    keywords,
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      title,
      description: formattedDescription,
      siteName: title,
    },
    twitter: {
      ...metadata.twitter,
      title,
      description: formattedDescription,
    },
    appleWebApp: {
      ...appleWebApp,
      startupImage: getStartupImages(pageNameLower),
    },
  };
};

const HomePage = async () => {
  const data = await getData<THome>(queryHome, pageNamePlural, snapshotHome);

  const {
    meta: { title },
    mugshot,
    technologies,
  } = data;

  return (
    <main id="main" className="home grow">
      <h1 className="sr-only">{title}</h1>
      <Mugshot mugshot={mugshot} technologies={technologies} />
      <Suspense>
        <Particles />
      </Suspense>
    </main>
  );
};

export default HomePage;
export { generateMetadata, viewport };

export const revalidate = 86400;
