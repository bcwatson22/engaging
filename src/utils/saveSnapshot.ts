import { writeFile } from 'fs/promises';
import path from 'path';

import { fetchCms } from '../queries/client.ts';
import { queryCV } from '../queries/cv.ts';
import { queryHome } from '../queries/home.ts';

/* Writes the committed fallback that getData serves when Hygraph is
   unreachable. Run before `next build` so the snapshot compiled into the
   bundle is the one this build fetched, which is what the old render-time
   write-back could never achieve. */

const snapshotDir = 'src/data/snapshot';
const indent = 2;

const pages = [
  { key: 'homes', name: 'home', query: queryHome },
  { key: 'cvs', name: 'cv', query: queryCV },
];

const errorMessage = 'Could not refresh the CMS snapshot:';

const fetchQuery = async (query: string, key: string): Promise<unknown> => {
  const { data, errors } = await fetchCms<unknown>(query);

  if (errors) throw new Error(errors.map(({ message }) => message).join(', '));

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
