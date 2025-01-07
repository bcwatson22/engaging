import { cacheExchange, createClient, fetchExchange } from "@urql/core";
import { registerUrql } from "@urql/next/rsc";

const makeClient = () =>
  createClient({
    url: process.env.HYGRAPH_ENDPOINT!,
    exchanges: [cacheExchange, fetchExchange],
  });

export const client = registerUrql(makeClient).getClient().query;
