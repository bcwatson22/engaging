---
max_turns: 4
allowed_tools: []
runs: 3
---

You are the monthly dependency routine, at the point where the bumps in
`apply` are already written into package.json and installed. Everything you
need is in this message: there are no files to read and no commands to run, and
the output of the commands you would have run is quoted below.

Decide what to do, then reply in this shape and nothing else:

ACTION: ship | drop-then-ship | abandon
DROPPED: comma separated package names, or none
WHY: one or two sentences. Quote the error that decided it, where there is one.
HELD: each major you would name in the PR, with its version jump and how long
it has been held, or none

# The rules

# Bumping dependencies

Read by two callers, which is why it lives here rather than inline in a
workflow:

- `.github/workflows/dependencies.yml`, the monthly run.
- `evals/dependencies/`, a suite that scores this judgement against recorded
  plans and verify output.

A copy of these rules in either place would drift from the other, and an eval
that passes against a stale duplicate reports confidence it has not earned.
Change the rules here and both callers change together. `pnpm check:evals`
fails if the suite's prompts no longer match this file.

## The task

`dependencies.json` describes this month's dependency bumps: `apply` has the
patch and minor ones already written into package.json and installed, and
`hold` has the majors, deliberately left alone.

If `apply` is empty, change nothing, print one line saying the tree is up to
date, and stop. That is a success.

Otherwise:

1. Run `pnpm verify`. If it passes, go to step 3.

2. If it fails, work out which bump caused it. Revert that one package in
   package.json to its `from` version, run `pnpm install
--no-frozen-lockfile`, and run `pnpm verify` again. Repeat until it passes
   or nothing is left to drop. Keep a note of each package you dropped and the
   error that made you drop it - that list is the most useful thing in the PR.

   Do not change any application code, test or config to make a bump pass. A
   dependency that needs code changes is a dependency to hold back and
   mention, not one to force through. The only files you may edit are
   package.json and pnpm-lock.yaml.

   **This is the rule most worth refusing on.** Lowering a coverage threshold,
   skipping a test, adding a lint disable or relaxing a type is not making the
   bump pass; it is making the check stop asking. If the only route to green
   goes through a check, the answer is to drop the package.

3. Commit on the branch name you were given - that exact name, which a check
   after this step inspects - and open a PR with
   `gh pr create --assignee bcwatson22`. Title: "chore: bump dependencies for
   <Month Year>". Body, as prose rather than a checklist:

   - what was raised, grouped so it reads quickly
   - what was dropped, with the error that caused it
   - what was held back as a major, with its version jump, and since when.
     Read the previous months' PRs with `gh pr list --search "chore: bump
dependencies" --state all` and say how long each major has been sitting
     there. A list that repeats unchanged for months is the thing this routine
     is least good at surfacing, so name it: "held back since July" is
     pressure, "held back" is wallpaper. Mention that
     `.github/workflows/dependencyMajor.yml` is how to take one on, and name
     the packages that have to move together - a major rarely arrives alone,
     as vitest and its coverage providers do
   - anything else you noticed worth a second look

## Always

Never merge, never push to main, and never use `--no-verify`. If `pnpm verify`
cannot be made to pass by dropping packages, revert package.json and
pnpm-lock.yaml entirely, open no PR, and explain what happened in your final
message so the run's log is the record.


# dependencies.json

```json
{
  "apply": [
    {
      "name": "oxlint",
      "from": "1.86.0",
      "to": "1.87.0",
      "change": "minor",
      "dependencyType": "devDependencies"
    },
    {
      "name": "oxlint-tsgolint",
      "from": "7.0.2003",
      "to": "7.1.0",
      "change": "minor",
      "dependencyType": "devDependencies"
    },
    {
      "name": "sharp",
      "from": "0.35.5",
      "to": "0.35.6",
      "change": "patch",
      "dependencyType": "dependencies"
    }
  ],
  "hold": []
}
```

# What `pnpm verify` printed

```
> engaging@1.1.0 lint:types
> oxlint --type-aware

  x typescript-eslint(no-unnecessary-condition): Unnecessary conditional, value is always truthy.
    ,-[src/data/functions/getStatus.ts:34:7]
 33 |   const parsed = statusSchema.safeParse(body);
 34 |   if (parsed.data) return parsed.data;
    :       ^^^^^^^^^^^
 35 |   return fallback;
    `----
  help: This check was added in oxlint-tsgolint 7.1.0.

Found 1 error, 0 warnings.

 ELIFECYCLE  Command failed with exit code 1.
```
