import type { Metadata } from "next";
import { Suspense } from "react";

import { Copyright } from "@/components/atoms/Copyright/Copyright";
import { Particles } from "@/components/atoms/Particles/Particles";
import { Mugshot } from "@/components/organisms/Mugshot/Mugshot";
import { appleWebApp, metadata, viewport } from "@/constants/metadata";
import { getStartupImages } from "@/constants/startupImages";
import { cacheHome } from "@/data/cache/home";
import { getData } from "@/data/functions/getData";
import type { THome } from "@/data/types/home";
import { queryHome } from "@/queries/home";
import { formatExperience } from "@/utils/formatExperience";

const pageNameLower = "home";
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
      <footer className="footer">
        <Copyright />
      </footer>
    </main>
  );
};

export default HomePage;
export { generateMetadata, viewport };

/* Next parses route segment config statically, so this has to be a plain
   numeric literal here — not an import, a re-export, or arithmetic.
   86400 = one day in seconds. */
export const revalidate = 86400;
