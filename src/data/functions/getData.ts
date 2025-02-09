import type { TypedDocumentNode } from "@urql/core";

import { client } from "@/queries/client";

const getData = async <Data>(
  query: TypedDocumentNode,
  key: string,
  fallback: Data
): Promise<Data> => {
  const { data, error } = await client(query, {});

  if (error) console.error("Error trying to fetch page data:", error);

  return data?.[key]?.[0] ? data[key][0] : fallback;
};

export { getData };
