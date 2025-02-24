import type { Metadata } from "next";
import { Suspense } from "react";

import { queryHome } from "@/queries/home";

import type { THome } from "@/data/types/home";
import { getData } from "@/data/functions/getData";
import { saveData, type TPages } from "@/data/functions/saveData";
import { cacheHome } from "@/data/cache/home";

import { Particles } from "@/components/atoms/Particles/Particles";
import { Cookie } from "@/components/molecules/Cookie/Cookie";
import { Mugshot } from "@/components/organisms/Mugshot/Mugshot";

import { revalidate } from "@/constants/common";
import { appleWebApp, metadata, viewport } from "@/constants/metadata";

const pageName: keyof TPages = "CV";
const pageNameLower = pageName.toLowerCase();
const pageNamePlural = "cvs";

const generateMetadata = async (): Promise<Metadata> => {
  const {
    meta: { title, description, keywords },
  } = await getData<THome>(queryHome, pageNamePlural, cacheHome);

  return {
    title,
    description,
    keywords,
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      title,
      description,
      siteName: title,
    },
    twitter: {
      ...metadata.twitter,
      title,
      description,
    },
    appleWebApp: {
      ...appleWebApp,
      startupImage: [
        `/startup-${pageNameLower}.png`,
        {
          url: `/startup-${pageNameLower}-2x.png`,
          media: "(device-width: 768px) and (device-height: 1024px)",
        },
      ],
    },
  };
};

const HomePage = async () => {
  const data = await getData<THome>(queryHome, "homes", cacheHome);

  await saveData(data, "Home", 3);

  const {
    meta: { title, cookie },
    mugshot,
    technologies,
  } = data;

  return (
    <>
      <main className="home main">
        <h1 className="sr-only">{title}</h1>
        <Mugshot mugshot={mugshot} technologies={technologies} />
        <Suspense>
          <Particles />
        </Suspense>
        <Suspense>
          <Cookie message={cookie} className="banner" hasCopyright />
        </Suspense>
      </main>
    </>
  );
};

export default HomePage;
export { generateMetadata, viewport, revalidate };
