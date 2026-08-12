import { writeFile } from "fs/promises";
import path from "path";

import { queryCV } from "../queries/cv.ts";
import { queryHome } from "../queries/home.ts";

/* Writes the committed fallback that getData serves when Hygraph is
   unreachable. Run before `next build` so the snapshot compiled into the
   bundle is the one this build fetched, which is what the old render-time
   write-back could never achieve. */

const snapshotDir = "src/data/snapshot";
const indent = 2;

const pages = [
  { key: "homes", name: "home", query: queryHome },
  { key: "cvs", name: "cv", query: queryCV },
];

const errorMessage = "Could not refresh the CMS snapshot:";

type TResponse = {
  data?: Record<string, unknown[]>;
  errors?: { message: string }[];
};

const fetchQuery = async (query: string, key: string): Promise<unknown> => {
  const response = await fetch(process.env.HYGRAPH_ENDPOINT!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HYGRAPH_TOKEN}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok)
    throw new Error(`${response.status} ${response.statusText}`);

  const { data, errors }: TResponse = await response.json();

  if (errors) throw new Error(errors.map(({ message }) => message).join(", "));

  const item = data?.[key]?.[0];

  if (!item) throw new Error(`No ${key} returned`);

  return item;
};

/* Fails soft on purpose — a stale snapshot still builds a working site,
   whereas a non-zero exit here would take the whole build down. */
const saveSnapshot = async (): Promise<void> => {
  try {
    for (const { key, name, query } of pages) {
      const item = await fetchQuery(query, key);

      await writeFile(
        path.join(process.cwd(), `${snapshotDir}/${name}.json`),
        `${JSON.stringify(item, null, indent)}\n`,
      );

      console.log(`Snapshot updated: ${name}.json`);
    }
  } catch (error) {
    console.error(errorMessage, error);
  }
};

export { saveSnapshot, fetchQuery, pages, snapshotDir, errorMessage };
