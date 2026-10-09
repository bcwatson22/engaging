/* Writes each case's prompt.md from the real rules plus the case's recorded
   inputs: the plan the script produced, the verify output it provoked, and
   whatever `gh pr list` would have returned.

   Generated for the same reason as the PageSpeed suite: a second copy of the
   rules drifts, and `pnpm check:evals` fails if a prompt here is not what this
   script would write.

   The agent is asked for a decision rather than left to run commands, because
   a case has to be reproducible and `pnpm update` is not. Everything the
   judgement actually depends on is text, so text is what a case holds.

   Run: node evals/dependencies/build.ts [--check] */
import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, '../..');
const check = process.argv.includes('--check');

const read = (file: string): Promise<string> =>
  readFile(file, 'utf8').then(
    (text) => text.trim(),
    () => '',
  );

const promptFor = (
  rules: string,
  plan: string,
  verify: string,
  context: string,
): string =>
  `---
max_turns: 4
allowed_tools: []
runs: 3
---

You are the monthly dependency routine, at the point where the bumps in
\`apply\` are already written into package.json and installed. Everything you
need is in this message: there are no files to read and no commands to run, and
the output of the commands you would have run is quoted below.

Decide what to do, then reply in this shape and nothing else:

ACTION: ship | drop-then-ship | abandon
DROPPED: comma separated package names, or none
WHY: one or two sentences. Quote the error that decided it, where there is one.
HELD: each major you would name in the PR, with its version jump and how long
it has been held, or none

# The rules

${rules}

# dependencies.json

\`\`\`json
${plan}
\`\`\`
${
  verify
    ? `
# What \`pnpm verify\` printed

\`\`\`
${verify}
\`\`\`
`
    : `
# What \`pnpm verify\` printed

It passed, with nothing on stderr.
`
}${
    context
      ? `
# What you would otherwise look up

${context}
`
      : ''
  }`;

const rules = await readFile(
  path.join(root, '.github/prompts/dependencies.md'),
  'utf8',
);

const dirs = (await readdir(here, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map(({ name }) => name)
  .sort();

let stale = 0;

for (const name of dirs) {
  const plan = await read(path.join(here, name, 'plan.json'));

  /* A directory without a plan is not a case - results/, for one. */
  if (!plan) continue;

  const [verify, context] = await Promise.all([
    read(path.join(here, name, 'verify.txt')),
    read(path.join(here, name, 'context.txt')),
  ]);

  const wanted = promptFor(rules, plan, verify, context);
  const target = path.join(here, name, 'prompt.md');

  if ((await read(target)) === wanted.trim()) continue;

  if (check) {
    console.error(`stale: evals/dependencies/${name}/prompt.md`);
    stale++;
    continue;
  }

  await writeFile(target, wanted);
  console.log(`wrote evals/dependencies/${name}/prompt.md`);
}

if (stale)
  throw new Error(
    `${stale} prompt(s) do not match the rules. Run: node evals/dependencies/build.ts`,
  );

if (check) console.log(`${dirs.length} dependency prompt(s) up to date`);
