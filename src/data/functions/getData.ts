import { unstable_cache } from "next/cache";

import { revalidate } from "@/constants/common";
import { fetchCms } from "@/queries/client";

const cmsTag = "cms";
const errorMessage = "Error trying to fetch page data:";
const emptyMessage = "No data returned for";

const fetchData = async <Data>(query: string, key: string): Promise<Data> => {
  const { data, errors } = await fetchCms<Data>(query);

  if (errors) throw new Error(errors.map(({ message }) => message).join(", "));

  const item = data?.[key]?.[0];

  if (!item) throw new Error(`${emptyMessage} ${key}`);

  return item;
};

/* Throw inside, catch outside. If fetchData returned the fallback itself,
   unstable_cache would persist it for a full day and freeze the site on stale
   data after one transient blip. A rejection never reaches the cache-write
   path, so failures are not cached and are retried on the next request.

   keyParts must include `key`: the cache key is the callback source plus the
   parts, and the arrow body stringifies identically at both call sites, so
   ["homes"] vs ["cvs"] is the only thing stopping CV data being served to the
   home page. */
const getData = async <Data>(
  query: string,
  key: string,
  fallback: Data,
): Promise<Data> => {
  try {
    return await unstable_cache(() => fetchData<Data>(query, key), [key], {
      tags: [cmsTag],
      revalidate,
    })();
  } catch (error) {
    console.error(errorMessage, error);

    return fallback;
  }
};

export { getData, fetchData, cmsTag, errorMessage, emptyMessage };
