/* Writes each case's prompt.md from three sources: the real judging rules, the
   README section they are judged against, and the case's own report.json.

   The README section is a frozen copy in readme.md, not the live README. The
   cases' reports were written against that table - "held" means held against
   those figures - so a live README would silently change what every case
   tests the first time the routine published. It also failed CI on #109, the
   routine's own README update, which the agent cannot regenerate prompts for.
   Change readme.md only alongside the reports that depend on it.

   Generated rather than written by hand for the reason .github/prompts exists
   at all: a second copy of the rules drifts from the first, and a suite passing
   against a stale copy reports confidence it has not earned. `pnpm verify`
   fails if a prompt.md here is not what this script would write.

   Run: node evals/pagespeed/build.ts [--check] */
import { readFile } from 'fs/promises';
import path from 'path';

import { buildSuite } from '../suite.ts';

const here = path.dirname(new URL(import.meta.url).pathname);

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

/* Read once rather than per case: every case is judged against the same
   table. */
const performance = (
  await readFile(path.join(here, 'readme.md'), 'utf8')
).trim();

await buildSuite({
  dir: here,
  rules: '.github/prompts/pageSpeed.md',
  required: 'report.json',
  render: (rules, report) => promptFor(rules, performance, report),
});
