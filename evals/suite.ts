/* The part every suite's builder does the same way: find the cases, render
   each one's prompt from the rules plus its own recorded inputs, and either
   write it or report that it is stale.

   Extracted when a third suite arrived and the loop had been copied twice.
   What is deliberately *not* shared is the template: each suite hands the
   agent a different set of things, and a single template with three branches
   would be harder to read than three templates. */
import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

/* Trimmed, and empty rather than throwing when absent - an optional input is
   how a case says "verify passed" or "there is no history to read". */
const read = (file: string): Promise<string> =>
  readFile(file, 'utf8').then(
    (text) => text.trim(),
    () => '',
  );

type Suite = {
  /* Where the cases live, and where this builder's own file sits. */
  dir: string;
  /* The one source of the rules, relative to the repo root. */
  rules: string;
  /* The file that makes a directory a case. Without it, the directory is
     something else - results/, or a builder's own folder. */
  required: string;
  /* Everything else a case may hold, read in this order and passed through. */
  optional?: string[];
  render: (rules: string, required: string, optional: string[]) => string;
};

const buildSuite = async ({
  dir,
  rules,
  required,
  optional = [],
  render,
}: Suite): Promise<void> => {
  const root = path.resolve(dir, '../..');
  const check = process.argv.includes('--check');
  const rulesText = await readFile(path.join(root, rules), 'utf8');

  const names = (await readdir(dir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map(({ name }) => name)
    .sort();

  let stale = 0;
  let cases = 0;

  for (const name of names) {
    const main = await read(path.join(dir, name, required));

    if (!main) continue;

    cases++;

    const extras = await Promise.all(
      optional.map((file) => read(path.join(dir, name, file))),
    );

    const wanted = render(rulesText, main, extras);
    const target = path.join(dir, name, 'prompt.md');

    if ((await read(target)) === wanted.trim()) continue;

    if (check) {
      console.error(`stale: ${path.relative(root, target)}`);
      stale++;
      continue;
    }

    await writeFile(target, wanted);
    console.log(`wrote ${path.relative(root, target)}`);
  }

  if (stale)
    throw new Error(
      `${stale} prompt(s) do not match ${rules}. Run: node ${path.relative(root, path.join(dir, 'build.ts'))}`,
    );

  if (check)
    console.log(`${cases} prompt(s) up to date in ${path.basename(dir)}`);
};

export { buildSuite, read };
export type { Suite };
