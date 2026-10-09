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
      "name": "sharp",
      "from": "0.35.5",
      "to": "0.35.6",
      "change": "patch",
      "dependencyType": "dependencies"
    },
    {
      "name": "vite",
      "from": "8.3.2",
      "to": "8.3.4",
      "change": "patch",
      "dependencyType": "devDependencies"
    }
  ],
  "hold": [
    {
      "name": "@types/node",
      "from": "22.20.1",
      "to": "26.6.4",
      "change": "major",
      "dependencyType": "devDependencies"
    },
    {
      "name": "motion",
      "from": "13.4.0",
      "to": "14.0.0",
      "change": "major",
      "dependencyType": "dependencies"
    }
  ]
}
```

# What `pnpm verify` printed

It passed, with nothing on stderr.

# What you would otherwise look up

Today is 1 November 2026.

`gh pr list --search "chore: bump dependencies" --state all` returns two, and
this is what each said about majors it held back:

#79, "chore: bump dependencies for October 2026", merged 2026-10-02:
  Held back two majors, both from `dependencies.json`'s `hold` list:
  - `@types/node` 22.20.1 -> 26.6.4 - held back since September (PR #69,
    2026-09-22), so a month unchanged now.
  - `motion` 13.4.0 -> 14.0.0 - new to the hold list this month, first time
    it's come up.

#69, "chore: bump dependencies for September 2026", merged 2026-09-22:
  Held back one major: `@types/node` 22.20.1 -> 26.6.4. First time it has
  come up.
