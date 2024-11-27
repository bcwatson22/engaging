import { TypedDocumentNode } from "@urql/core";

import { client } from "@/queries/client";

export const getData = async <Result>(
  query: TypedDocumentNode,
  key: string,
  fallback: Result
): Promise<Result> => {
  const { data } = await client().query(query, {});

  return data ? data[key][0] : fallback;
};
