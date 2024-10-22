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

const GET_CV = gql`
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

const makeClient = () =>
  createClient({
    url: process.env.HYGRAPH_ENDPOINT!,
    exchanges: [cacheExchange, fetchExchange],
  });

const { getClient } = registerUrql(makeClient);

const dateFormat = "MMMM YYYY";

const Home: NextPage = async () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Engaging Engineering</h1>
    </main>
  );
};

export const revalidate = 3600 * 24;

export default Home;

// export const getStaticProps = async () => {
//   const { data } = await client.query({
//     query: gql`
//       query {
//         cvs(first: 1) {
//           id
//           logo {
//             id
//             url
//           }
//           title
//           intro
//           address
//           contactLinks {
//             id
//             text
//             target
//           }
//           gigs {
//             id
//             title
//             company
//             logo {
//               id
//               url
//             }
//             city
//             capacity
//             dates
//             bullets
//           }
//         }
//       }
//     `,
//   });

//   console.log(data);

//   return {
//     props: {
//       cv: data,
//     },
//   };
// };
