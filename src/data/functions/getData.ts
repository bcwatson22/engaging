import { TypedDocumentNode } from "@urql/core";

import { client } from "@/queries/client";

export const getData = async <Data>(
  query: TypedDocumentNode,
  key: string,
  fallback: Data
): Promise<Data> => {
  const { data } = await client(query, {});

  return data ? data[key][0] : fallback;
};
