import Image from "next/image";
import { NextPage } from "next";
import {
  OperationResult,
  cacheExchange,
  createClient,
  fetchExchange,
  gql,
} from "@urql/core";
import { registerUrql } from "@urql/next/rsc";
import dayjs from "dayjs";
import { Section } from "@/components/organisms/Section";
import { Gig } from "@/components/organisms/Gig";
import { Header } from "@/components/molecules/Header";

const getCvQuery = gql`
  query {
    cvs(first: 1) {
      id
      logo {
        id
        url
      }
      title
      intro
      address
      contactLinks {
        id
        text
        target
      }
      gigs {
        id
        role
        company
        logo {
          id
          url
        }
        city
        capacity
        dates
        bullets
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

const Resume: NextPage = async () => {
  const response: OperationResult<Result> = await getClient().query(
    getCvQuery,
    {}
  );

  const {
    title,
    logo,
    intro,
    address,
    contactLinks,
    gigs,
    skills,
    qualifications,
    onlineLinks,
    references,
  } = response!.data!.cvs![0];

  return (
    <main className="min-h-screen m-6 p-6 border-3 border-theme-2-b overflow-hidden">
      <Header title={title} logo={logo} intro={intro} />
      <div className="sections">
        <Section heading="Details and digits">
          <p className="leading-8">Address is {address}</p>
          <ul>
            {contactLinks?.map(({ id, text, target }) => (
              <li key={id}>
                <a href={target}>{text}</a>
              </li>
            ))}
          </ul>
        </Section>
        <Section heading="Experience">
          {gigs?.map((gig) => (
            <Gig key={gig.id} {...gig} />
          ))}
        </Section>
      </div>
    </main>
  );
};

export const revalidate = 3600 * 24;

export default Resume;
