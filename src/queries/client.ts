import { cacheExchange, createClient, fetchExchange } from "@urql/core";
import { registerUrql } from "@urql/next/rsc";

const makeClient = () =>
  createClient({
    url: process.env.HYGRAPH_ENDPOINT!,
    exchanges: [cacheExchange, fetchExchange],
  });

/* Bound to its client: pulling `query` off unbound leaves `this` undefined if
   urql ever reaches for it. */
const { getClient } = registerUrql(makeClient);
const client: ReturnType<typeof getClient>["query"] = (...args) =>
  getClient().query(...args);

export { client };
