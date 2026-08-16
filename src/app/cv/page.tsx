import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import ReactMarkdown from 'react-markdown';

import { Copyright } from '@/components/atoms/Copyright/Copyright';
import { Details } from '@/components/molecules/Details/Details';
import { Header } from '@/components/molecules/Header/Header';
import { Qualification } from '@/components/molecules/Qualification/Qualification';
import { Reference } from '@/components/molecules/Reference/Reference';
import { Gig } from '@/components/organisms/Gig/Gig';
import { Section } from '@/components/organisms/Section/Section';
import {
  appleWebApp,
  metadata,
  themeColor,
  viewport,
} from '@/constants/metadata';
import { getStartupImages } from '@/constants/startupImages';
import { getData } from '@/data/functions/getData';
import { snapshotCV } from '@/data/snapshot/snapshot';
import type { TCV } from '@/data/types/cv';
import { queryCV } from '@/queries/cv';
import { formatExperience } from '@/utils/formatExperience';

const pageNameLower = 'cv';
const pageNamePlural = 'cvs';

const generateMetadata = async (): Promise<Metadata> => {
  const {
    meta: { title, description, keywords },
  } = await getData<TCV>(queryCV, pageNamePlural, snapshotCV);

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

const generateViewport = async (): Promise<Viewport> => ({
  ...viewport,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9fafb' },
    {
      media: '(prefers-color-scheme: dark)',
      color: themeColor,
    },
  ],
});

const CVPage = async () => {
  const data = await getData<TCV>(queryCV, pageNamePlural, snapshotCV);

  const {
    meta: { title },
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
          <Suspense>
            <Copyright />
          </Suspense>
        </div>
      </div>
    </main>
  );
};

export default CVPage;
export { generateMetadata, generateViewport };

/* Next parses route segment config statically, so this has to be a plain
   numeric literal here — not an import, a re-export, or arithmetic.
   86400 = one day in seconds. */
export const revalidate = 86400;
