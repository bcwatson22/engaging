/* Writes each case's prompt.md from three sources: the real judging rules, the
   README section they are judged against, and the case's own report.json.

   Generated rather than written by hand for the reason .github/prompts
   exists at all: a second copy of the rules drifts from the first, and a suite
   passing against a stale copy reports confidence it has not earned. `pnpm
   verify` fails if a prompt.md here is not what this script would write, so
   editing the rules and forgetting the suite is a failing check rather than a
   quiet lie.

   Run: node evals/pagespeed/build.ts [--check] */
import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, '../..');
const rulesPath = path.join(root, '.github/prompts/pageSpeed.md');
const check = process.argv.includes('--check');

const section = (readme: string, heading: string): string => {
  const start = readme.indexOf(`## ${heading}`);
  const after = readme.indexOf('\n## ', start + 1);

  if (start < 0) throw new Error(`No "## ${heading}" in the README`);

  return readme.slice(start, after < 0 ? undefined : after).trim();
};

const promptFor = (rules: string, performance: string, report: string) =>
  `---
max_turns: 4
allowed_tools: []
runs: 3
---

You are the monthly PageSpeed routine. Everything you need is in this message;
there are no files to read and no commands to run.

Work out the outcome, then reply with it in this shape and nothing else:

OUTCOME: Held | Unconfirmed | Moved
WHY: one or two sentences, naming the figures that decided it and the numbers
behind them. For Unconfirmed, say which gate failed.

# The rules

${rules}

# The README's current Performance section

${performance}

# This month's pageSpeed.json

\`\`\`json
${report}
\`\`\`
`;

const [rules, readme] = await Promise.all([
  readFile(rulesPath, 'utf8'),
  readFile(path.join(root, 'README.md'), 'utf8'),
]);

const performance = section(readme, 'Performance');
/* A case is a directory holding a report.json. Anything else below here is
   not one, so it is skipped rather than failing the build. */
const isCase = async (name: string): Promise<boolean> =>
  readFile(path.join(here, name, 'report.json'), 'utf8').then(
    () => true,
    () => false,
  );

const dirs = (await readdir(here, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map(({ name }) => name)
  .sort();

const cases = (
  await Promise.all(
    dirs.map(async (name) => ((await isCase(name)) ? name : '')),
  )
).filter(Boolean);

let stale = 0;

for (const name of cases) {
  const report = (
    await readFile(path.join(here, name, 'report.json'), 'utf8')
  ).trim();
  const wanted = promptFor(rules, performance, report);
  const target = path.join(here, name, 'prompt.md');
  const current = await readFile(target, 'utf8').catch(() => '');

  if (current === wanted) continue;

  if (check) {
    console.error(`stale: evals/pagespeed/${name}/prompt.md`);
    stale++;
    continue;
  }

  await writeFile(target, wanted);
  console.log(`wrote evals/pagespeed/${name}/prompt.md`);
}

if (stale)
  throw new Error(
    `${stale} prompt(s) do not match the rules. Run: node evals/pagespeed/build.ts`,
  );

if (!stale && check) console.log(`${cases.length} prompt(s) up to date`);
