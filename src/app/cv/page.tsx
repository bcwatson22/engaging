import { NextPage } from "next";
import {
  OperationResult,
  cacheExchange,
  createClient,
  fetchExchange,
  gql,
} from "@urql/core";
import { registerUrql } from "@urql/next/rsc";
import ReactMarkdown from "react-markdown";

import { Section } from "@/components/organisms/Section";
import { Gig } from "@/components/organisms/Gig";
import { Header } from "@/components/molecules/Header";
import { Details } from "@/components/molecules/Details";
import { Qualification } from "@/components/molecules/Qualification";
import { Reference } from "@/components/molecules/Reference";

const getCvQuery = gql`
  query {
    cvs(first: 1) {
      id
      logoLightBackground {
        id
        url
      }
      logoDarkBackground {
        id
        url
      }
      title
      intro
      address {
        id
        streetAddress
        locality
        countryName
        postalCode
      }
      contactLinks {
        id
        text
        target
      }
      gigs {
        id
        company
        logo {
          id
          url
        }
        city
        roles {
          id
          role
          dates
          capacity
          bullets
        }
      }
      skills
      qualifications {
        id
        institution
        location
        dates
        description
      }
      onlineLinks {
        id
        text
        target
      }
      references {
        id
        person
        role
        company
        link {
          id
          text
          target
        }
      }
    }
  }
`;

type Result = { cvs: CV[] };

const makeClient = () =>
  createClient({
    url: process.env.HYGRAPH_ENDPOINT!,
    exchanges: [cacheExchange, fetchExchange],
  });

const { getClient } = registerUrql(makeClient);

const CVPage: NextPage = async () => {
  const { data }: OperationResult<Result> = await getClient().query(
    getCvQuery,
    {}
  );

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
  } = data!.cvs[0];

  return (
    <main className="main">
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
          {gigs?.map((gig, i) => (
            <Gig key={gig.id} {...gig} delay={i === 0 ? 0.2 : 0} />
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
    </main>
  );
};

export const revalidate = 3600 * 24;

export default CVPage;
