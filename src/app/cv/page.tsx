import type { Metadata, Viewport } from "next";
import ReactMarkdown from "react-markdown";

import { queryCV } from "@/queries/cv";

import type { TCV } from "@/data/types/cv";
import { getData } from "@/data/functions/getData";
import { saveData, type TPages } from "@/data/functions/saveData";
import { cacheCV } from "@/data/cache/cv";

import { Header } from "@/components/molecules/Header/Header";
import { Details } from "@/components/molecules/Details/Details";
import { Qualification } from "@/components/molecules/Qualification/Qualification";
import { Reference } from "@/components/molecules/Reference/Reference";
import { Gig } from "@/components/organisms/Gig/Gig";
import { Section } from "@/components/organisms/Section/Section";

import { revalidate } from "@/constants/common";
import {
  appleWebApp,
  metadata,
  themeColor,
  viewport,
} from "@/constants/metadata";

const pageName: keyof TPages = "CV";
const pageNameLower = pageName.toLowerCase();
const pageNamePlural = "cvs";

const generateMetadata = async (): Promise<Metadata> => {
  const { title, description, keywords } = await getData<TCV>(
    queryCV,
    pageNamePlural,
    cacheCV
  );

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

const generateViewport = async (): Promise<Viewport> => ({
  ...viewport,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" },
    {
      media: "(prefers-color-scheme: dark)",
      color: themeColor,
    },
  ],
});

const CVPage = async () => {
  const data = await getData<TCV>(queryCV, pageNamePlural, cacheCV);

  await saveData(data, pageName);

  const {
    title,
    logoDarkBackground,
    logoLightBackground,
    intro,
    address,
    contactLinks,
    gigs,
    skills,
    qualifications,
    onlineLinks,
    references,
  } = data;

  return (
    <main className="cv main">
      <div className="wrapper">
        <div className="inner">
          <Header
            title={title}
            logoDarkBackground={logoDarkBackground}
            logoLightBackground={logoLightBackground}
            intro={intro}
          />
          <div className="sections">
            <Section heading="Digits" margin="0px">
              <Details address={address} links={contactLinks} />
            </Section>
            <Section heading="Experience" margin="0px" delay={0.1}>
              {gigs?.map((gig, index) => (
                <Gig key={gig.id} {...gig} delay={index === 0 ? 0.2 : 0} />
              ))}
            </Section>
            <Section heading="Skills">
              <ReactMarkdown>{skills}</ReactMarkdown>
            </Section>
            <Section heading="Qualifications">
              {qualifications?.map((qualification) => (
                <Qualification key={qualification.id} {...qualification} />
              ))}
            </Section>
            <Section heading="Profile">
              <Details links={onlineLinks} />
            </Section>
            <Section heading="References" margin="0px">
              {references?.map((reference) => (
                <Reference key={reference.id} {...reference} />
              ))}
            </Section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CVPage;
export { generateMetadata, generateViewport, revalidate };
