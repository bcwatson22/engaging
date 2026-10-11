/* Writes each case's prompt.md from the real rules plus the case's recorded
   inputs: the plan the script produced, the verify output it provoked, and
   whatever the run would otherwise have looked up.

   The agent is asked for a decision rather than left to run commands, because
   a case has to be reproducible and `pnpm update` is not. Everything the
   judgement actually depends on is text, so text is what a case holds.

   Run: node evals/dependencies/build.ts [--check] */
import path from 'path';

import { buildSuite } from '../suite.ts';

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

await buildSuite({
  dir: path.dirname(new URL(import.meta.url).pathname),
  rules: '.github/prompts/dependencies.md',
  required: 'plan.json',
  optional: ['verify.txt', 'context.txt'],
  render: (rules, plan, [verify = '', context = '']) =>
    promptFor(rules, plan, verify, context),
});
