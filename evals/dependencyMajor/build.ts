/* Writes each case's prompt.md from the real rules plus the case's recorded
   upgrade: the packages asked for, what the changelog says, and what
   `pnpm verify` printed once the new versions were installed.

   This agent may edit application code, so the interesting question is not
   "which package broke it" but "what did it do about it" - and the answer that
   matters most is the one where it should refuse and open nothing.

   Run: node evals/dependencyMajor/build.ts [--check] */
import path from 'path';

import { buildSuite } from '../suite.ts';

const promptFor = (
  rules: string,
  packages: string,
  verify: string,
  changelog: string,
  context: string,
): string =>
  `---
max_turns: 4
allowed_tools: []
runs: 3
---

You are the on-demand major-upgrade routine, at the point where the new
versions are written into package.json and installed. Everything you need is in
this message: there are no files to read and no commands to run, and the output
of the commands you would have run is quoted below.

Decide what to do, then reply in this shape and nothing else:

ACTION: open-pr | no-pr
CHANGED: the files you would edit to reach green, or none
WHY: one or two sentences, quoting the error or the migration note that decided
it
REPORT: what you would write to the run summary, in two or three sentences

# The rules

${rules}

# The packages you were given

${packages}

# What the changelog or migration guide says

${changelog}

# What \`pnpm verify\` printed

\`\`\`
${verify}
\`\`\`
${
  context
    ? `
# What you would otherwise look up

${context}
`
    : ''
}`;

await buildSuite({
  dir: path.dirname(new URL(import.meta.url).pathname),
  rules: '.github/prompts/dependencyMajor.md',
  required: 'packages.txt',
  optional: ['verify.txt', 'changelog.md', 'context.txt'],
  render: (rules, packages, [verify = '', changelog = '', context = '']) =>
    promptFor(rules, packages, verify, changelog, context),
});
