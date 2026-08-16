import { readFile } from 'fs/promises';
import path from 'path';

const fontFamily = 'Nunito';

/* Self-hosted rather than fetched from Google at render time.

   The OG route only re-renders on a cache miss — once a day, or after a
   deploy — but when it did, two round-trips to a third party sat on the
   request path. A failure there returns a 500, and crawlers cache failures:
   the image then reads as blank on every share until somebody notices and
   manually rescrapes. Reading from disk cannot fail that way.

   Ships in the serverless bundle via outputFileTracingIncludes in
   next.config.mjs. Without that entry this throws at runtime but passes
   locally, so the two must stay together. */
const fontPath = 'src/assets/fonts/Nunito-Regular.ttf';

const errorMessage = 'Failed to read font data';

const loadFont = async (): Promise<Buffer> => {
  try {
    return await readFile(path.join(process.cwd(), fontPath));
  } catch (error) {
    throw new Error(`${errorMessage}: ${String(error)}`);
  }
};

export { loadFont, errorMessage, fontFamily, fontPath };
