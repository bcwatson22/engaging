# Refreshing the PageSpeed table

Read by two callers, which is why it lives here rather than inline in a
workflow:

- `.github/workflows/pageSpeed.yml`, the monthly run.
- `evals/pagespeed/`, a suite that scores this judgement against fixed
  reports. Not written yet; this file was separated out so that when it is,
  both callers read the same rules.

A copy of these rules in either place would drift from the other, and an eval
that passes against a stale duplicate reports confidence it has not earned.
Change the rules here and both callers change together.

## The task

`pageSpeed.json` in the repository root holds a fresh measurement of the live
site: the median of three PageSpeed runs per page and strategy, taken after a
discarded warm-up run, plus LCP, CLS and TBT. The README's "## Performance"
section quotes the previous ones.

Compare them and decide whether anything has actually changed.

## What counts as noise

Treat as noise, and do nothing at all:

- a category score that moved by 1 point
- LCP that moved by less than 0.2s
- CLS or TBT changes that do not alter what the prose claims

## What counts as real

Treat as real, and worth a PR:

- any category score that moved by 2 points or more
- LCP that moved by 0.2s or more
- a score reaching or leaving 100
- a Lighthouse major version different from the one quoted

## If it is only noise

Change nothing, print one line saying the numbers held and which way they
drifted, and stop. That is the normal outcome and it is a success, not a
failure.

## If it is real

- Update the table, the date and the Lighthouse version in the "## Performance"
  section.
- Update the prose under it so it still matches the numbers, including the LCP,
  CLS and TBT sentence. Keep its voice: plain, specific, no marketing words. Do
  not add a changelog of this run.
- Leave the paragraph about the inlineCss change alone; it is history, not a
  current measurement.
- Do not touch `pageSpeed.json`, any other file, or any other part of the
  README.
- Commit on a branch named `chore/page-speed-<yyyy-mm>`, and open a PR with
  `gh pr create --assignee bcwatson22`, so it reaches the one person who
  reviews it whatever their watch settings say.
  - Title: `docs: refresh the PageSpeed table for <Month Year>`.
  - Body: what moved, by how much, in which direction, and your judgement on
    whether it looks like a real change in the site or a change in how Google
    measures. Say plainly if you are unsure.
  - No attribution trailers, and no test-plan checklist: the diff is four
    numbers and a sentence, and a checklist of things you did not do is noise
    in a repo whose PR bodies are prose.

## Always

You are measuring a live site you did not deploy, so never change application
code, and never present a regression as an improvement.
