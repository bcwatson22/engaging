import { cacheExchange, createClient, fetchExchange } from "@urql/core";
import { registerUrql } from "@urql/next/rsc";

const makeClient = () =>
  createClient({
    url: process.env.HYGRAPH_ENDPOINT!,
    exchanges: [cacheExchange, fetchExchange],
  });

const client = registerUrql(makeClient).getClient().query;

// const client = async (query: string) => {
//   // console.log({ query });
//   try {
//     if (!query) {
//       return;
//     }
//     // setIsLoading(true);
//     const headers = {
//       "content-type": "application/json",
//       Authorization: `Bearer ${process.env.HYGRAPH_TOKEN}`,
//     };
//     const requestBody = {
//       query,
//       // variables: { email },
//     };
//     const options = {
//       method: "POST",
//       headers,
//       body: JSON.stringify(requestBody),
//     };
//     // console.log(process.env.HYGRAPH_ENDPOINT!);
//     const response = await (
//       await fetch(process.env.HYGRAPH_ENDPOINT!, options)
//     ).json();
//     // console.log("RESPONSE FROM FETCH REQUEST", response?.data);
//     console.log({ response });
//     return response;
//     // setUserDetails(response?.data?.nextUser ?? {});
//   } catch (err) {
//     console.log("ERROR DURING FETCH REQUEST", err);
//   } finally {
//     // setIsLoading(false);
//   }
// };

export { client };
