import { TypedDocumentNode } from "@urql/core";

import { client } from "@/queries/client";

const getData = async <Data>(
  query: TypedDocumentNode,
  key: string,
  fallback: Data
): Promise<Data> => {
  const { data } = await client(query, {});

  return data?.[key]?.[0] ? data[key][0] : fallback;
};

export { getData };
