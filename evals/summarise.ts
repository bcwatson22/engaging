/* Turns a run's result.json into a verdict, and decides whether the job fails.

   A run that could not execute and a run that executed badly used to look like
   the same red cross. The first CI run of the full suite scored nine cases of
   twelve and stopped; the summary said nothing about the three that never ran,
   so the only honest reading of it was "something happened".

   Three outcomes, and they mean different things to whoever opens the run:

   - blocked: the credential ran out of allowance, or runs timed out. Nothing
     was learned. Re-run it later; do not touch the suite.
   - stopped: it began scoring and gave up, usually on the cost ceiling. The
     scores it did produce are real, the missing ones are not failures.
   - scored: every case ran. A red run here is a finding.

   Run: node evals/summarise.ts <result.json> <exit code> */
import { readdir, readFile } from 'fs/promises';
import path from 'path';

type Grader = { name: string; passed: boolean; explanation?: string };
type Run = { error?: string | null; graders: Grader[] };

type Case = {
  name: string;
  aggregates: { score: number; passRate: number };
  arms: Record<string, Run[]>;
};
type Result = {
  partial?: boolean;
  costUsd: number;
  durationSeconds: number;
  /* Set when the run was narrowed with --case, which is a deliberate subset
     rather than a run that gave up. */
  suite?: { caseFilter?: string };
  cases: Case[];
};

const here = path.dirname(new URL(import.meta.url).pathname);
const [resultPath, rawCode] = process.argv.slice(2);
const code = Number(rawCode ?? 0);

/* Every directory under the eval dir holding a generated prompt is a case the
   run was supposed to score. Counting them is the only way to notice the ones
   that never started: they are absent from the result rather than failing in
   it. */
const expected = async (): Promise<string[]> => {
  const found: string[] = [];

  for (const suite of await readdir(here, { withFileTypes: true })) {
    if (!suite.isDirectory() || suite.name === 'results') continue;

    for (const dir of await readdir(path.join(here, suite.name), {
      withFileTypes: true,
    })) {
      if (!dir.isDirectory()) continue;

      const prompt = path.join(here, suite.name, dir.name, 'prompt.md');

      await readFile(prompt, 'utf8').then(
        () => found.push(dir.name),
        () => undefined,
      );
    }
  }

  return found.sort();
};

/* A run that could not execute says so in two different places depending on
   how it died: an exhausted allowance surfaces in a grader's explanation,
   while a run that hung surfaces in the run's own error. The twelve-hour
   overnight run had `error: "timed out after 300s"` on 24 of its 36 runs and
   nothing in any explanation, which is how this function came to check
   both. */
const stoppers = /session limit|rate limit|timed out|quota/i;

const blockedBy = (result: Result): { reason: string; runs: number } | null => {
  const reasons = result.cases.flatMap((entry) =>
    Object.values(entry.arms)
      .flat()
      .flatMap((run) => [
        run.error ?? '',
        ...run.graders.map(({ explanation }) => explanation ?? ''),
      ]),
  );

  const hits = reasons.filter((text) => stoppers.test(text));

  return hits[0] ? { reason: hits[0], runs: hits.length } : null;
};

const say = (line: string): void => console.log(line);

const result = await readFile(resultPath, 'utf8').then(
  (text) => JSON.parse(text) as Result,
  () => null,
);

const cases = await expected();

if (!result) {
  say('## The run failed before scoring anything');
  say('');
  say(`No result file was written, and the CLI exited ${code}. Read the job`);
  say('log: this is a fault in the workflow or the credential, not a finding');
  say('about the suite.');
  process.exit(1);
}

const filtered = result.suite?.caseFilter;
const missing = filtered
  ? []
  : cases.filter((name) => !result.cases.some((entry) => entry.name === name));
const blocked = blockedBy(result);
const stopped = result.partial === true || missing.length > 0;

const every = filtered ? 'Every case in the subset' : 'Every case';

if (blocked) say('## The run was blocked, and scored nothing worth reading');
else if (stopped) say('## The run stopped early - scores are incomplete');
else if (code !== 0) say(`## ${every} ran, and at least one failed`);
else say(`## ${every} ran and passed`);

say('');

if (filtered && !blocked) {
  say(`Narrowed to \`--case ${filtered}\`, so this is a subset on purpose.`);
  say('');
}

if (blocked) {
  say(
    `\`${blocked.reason.trim()}\` - on ${blocked.runs} of the run's attempts.`,
  );
  say('');
  say('Nothing was learned about the suite. Re-run it when the allowance has');
  say('reset, and do not change a case on the strength of this run.');
  say('');
}

if (stopped && !blocked) {
  say(
    `${result.cases.length} of ${cases.length} cases scored. Missing: ${missing.join(', ')}.`,
  );
  say('');
  say('The usual cause is the cost ceiling. The scores below are real; the');
  say('absent cases are not failures.');
  say('');
}

say('| case | score | pass rate |');
say('| --- | --- | --- |');

for (const entry of result.cases)
  say(
    `| ${entry.name} | ${entry.aggregates.score.toFixed(2)} | ${Math.round(entry.aggregates.passRate * 100)}% |`,
  );

say('');
say(
  `$${result.costUsd.toFixed(2)} over ${result.durationSeconds}s. CLI exit ${code}.`,
);

process.exit(blocked || stopped || code !== 0 ? 1 : 0);
