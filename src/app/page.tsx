import type { Metadata } from "next";
import { Suspense } from "react";

import { queryHome } from "@/queries/home";

import type { THome } from "@/data/types/home";
import { getData } from "@/data/functions/getData";
import { saveData, type TPages } from "@/data/functions/saveData";
import { cacheHome } from "@/data/cache/home";

import { Particles } from "@/components/atoms/Particles/Particles";
import { Mugshot } from "@/components/organisms/Mugshot/Mugshot";

import { revalidate } from "@/constants/common";
import { appleWebApp, metadata, viewport } from "@/constants/metadata";
import { getStartupImages } from "@/constants/startupImages";
import { Copyright } from "@/components/atoms/Copyright/Copyright";

import { formatExperience } from "@/utils/formatExperience";

const pageName: keyof TPages = "Home";
const pageNameLower = pageName.toLowerCase();
const pageNamePlural = "homes";

const generateMetadata = async (): Promise<Metadata> => {
  const {
    meta: { title, description, keywords },
  } = await getData<THome>(queryHome, pageNamePlural, cacheHome);

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
  const data = await getData<THome>(queryHome, pageNamePlural, cacheHome);

  await saveData(data, pageName);

  const {
    meta: { title },
    mugshot,
    technologies,
  } = data;

  return (
    <main className="home main">
      <h1 className="sr-only">{title}</h1>
      <Mugshot mugshot={mugshot} technologies={technologies} />
      <Suspense>
        <Particles />
      </Suspense>
      <Suspense>
        <footer className="footer">
          <Copyright />
        </footer>
      </Suspense>
    </main>
  );
};

export default HomePage;
export { generateMetadata, viewport, revalidate };
