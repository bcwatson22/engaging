import type { NextPage, Metadata } from "next";
import ReactMarkdown from "react-markdown";

import { queryCV } from "@/queries/cv";

import { type TCV } from "@/data/types/cv";
import { getData } from "@/data/functions/getData";
import { saveData } from "@/data/functions/saveData";
import { cacheCV } from "@/data/cache/cv";

import { Header } from "@/components/molecules/Header/Header";
import { Details } from "@/components/molecules/Details/Details";
import { Qualification } from "@/components/molecules/Qualification/Qualification";
import { Reference } from "@/components/molecules/Reference/Reference";
import { Gig } from "@/components/organisms/Gig/Gig";
import { Section } from "@/components/organisms/Section/Section";

const generateMetadata = async (): Promise<Metadata> => {
  const { title, description } = await getData<TCV>(queryCV, "cvs", cacheCV);

  return {
    title,
    description,
  };
};

const CVPage: NextPage = async () => {
  const data = await getData<TCV>(queryCV, "cvs", cacheCV);

  await saveData(data, "CV");

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

const revalidate = 3600 * 24;

export default CVPage;
export { generateMetadata, revalidate };
