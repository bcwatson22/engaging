/* Writes each case's prompt.md from three sources: the real judging rules, the
   README section they are judged against, and the case's own report.json.

   Generated rather than written by hand for the reason .github/prompts exists
   at all: a second copy of the rules drifts from the first, and a suite passing
   against a stale copy reports confidence it has not earned. `pnpm verify`
   fails if a prompt.md here is not what this script would write.

   Run: node evals/pagespeed/build.ts [--check] */
import { readFile } from 'fs/promises';
import path from 'path';

import { buildSuite } from '../suite.ts';

const here = path.dirname(new URL(import.meta.url).pathname);

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

/* The README is read once rather than per case: every case is judged against
   the same table. */
const performance = section(
  await readFile(path.resolve(here, '../../README.md'), 'utf8'),
  'Performance',
);

await buildSuite({
  dir: here,
  rules: '.github/prompts/pageSpeed.md',
  required: 'report.json',
  render: (rules, report) => promptFor(rules, performance, report),
});
