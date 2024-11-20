import type { Metadata } from "next";
import { NextPage } from "next";
import { OperationResult } from "@urql/core";
import ReactMarkdown from "react-markdown";

import { cv } from "@/queries/cv";
import { client } from "@/queries/client";

import { Section } from "@/components/organisms/Section";
import { Gig } from "@/components/organisms/Gig";
import { Header } from "@/components/molecules/Header";
import { Details } from "@/components/molecules/Details";
import { Qualification } from "@/components/molecules/Qualification";
import { Reference } from "@/components/molecules/Reference";

import { mockCv } from "@/mocks/cv";

type Result = { cvs: CV[] };

const generateMetadata = async (): Promise<Metadata> => {
  const { data }: OperationResult<Result> = await client().query(cv, {});

  const { title, description } = data ? data.cvs[0] : mockCv;

  return {
    title,
    description,
  };
};

const CVPage: NextPage = async () => {
  const { data }: OperationResult<Result> = await client().query(cv, {});

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
  } = data ? data.cvs[0] : mockCv;

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
              {/* {gigs?.map((gig, i) => ( */}
              {/* <Gig key={gig.id} {...gig} delay={i === 0 ? 0.2 : 0} /> */}
              {/* ))} */}
              <Gig {...gigs[1]} delay={0} />
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
