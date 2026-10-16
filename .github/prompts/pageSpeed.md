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
site. The README's "## Performance" section quotes the previous one. Compare
them and decide whether anything has actually changed.

## What the report gives you

The site is measured twice, fifteen minutes apart, three runs each after a
discarded warm-up. Per page and strategy, every figure carries:

- `sittings` — one median per sitting, in the order they were taken.
- `min` and `max` — the lowest and highest single run across both sittings.

**The two sittings are the evidence, and their agreement is the gate.** A
figure whose sittings read 99 and 91 has not told you anything about the site;
it has told you the measurement depends on something other than the code.

This shape exists because the previous two attempts failed in the same place.
For two months a 2-point move counted as a real change, and #78 published a
desktop score of 69 on those rules while saying in its own body that it did
not believe it. The fix after that recorded the spread within one sitting —
and the next pair of sittings read 99 and 91 on Home mobile with the three
runs inside each one agreeing to within a point. Runs nodding along to each
other is not evidence. Sittings separated in time, agreeing, is.

## Held frames: already handled

One kind of bad run has been removed before you see the report, by a fixed
test that you don't apply yourself. A run where PageSpeed's browser drew
nothing for over 500ms after the page had finished parsing is a held frame:
the test machine stalled with the page ready, which says nothing about the
site. Those runs were measured again, up to five tries, and every discarded
attempt is listed in `heldFrames` when the report has it. A `kept` entry
that isn't null means all five tries were held and that run counts anyway.

- Don't drop or adjust anything further. The discarding is done, by a test
  that ignores the score.
- When `heldFrames` lists discarded attempts, say how many in the report and
  in any PR body.
- A `kept` held run is the likely reason its sitting disagrees with the
  other. Name it as the cause instead of the site, and the outcome is still
  Unconfirmed.

## The quiet band

Used at two of the three gates below, so it is worth stating once. Two numbers
for the same figure are **within the quiet band** when they differ by:

- 1 point or less, for a category score
- less than 0.2s, for LCP
- anything that does not alter what the prose claims, for CLS and TBT

## Gate 1 — do the two sittings agree

For each figure, compare its two entries in `sittings` with each other, before
comparing anything with the README.

- **Outside the quiet band → Unconfirmed, and stop.** The measurement
  disagreed with itself across fifteen minutes, so it cannot tell you anything
  about the site. This is the gate #78 and its successor both lacked.
- Within the quiet band → the figure is steady. Carry the **less flattering**
  of the two sittings forward: the lower score, the higher LCP or TBT. If the
  site genuinely sits between two states, the README should quote the one a
  visitor is at least as likely to get.

## Gate 2 — has the steady figure moved

Compare that figure with the README.

- Within the quiet band → **quiet**. Nothing to report for this figure.
- Outside it, or it reached or left 100, or the Lighthouse version quoted in
  the README is not the one in the report → **flagged**, and on to gate 3.

"Major version" used to be the wording here, which three eval runs read three
different ways on a 13.4.1 against 13.5.0. Any difference flags: the README
quotes a full version, and a minor Lighthouse release changes audits often
enough that a stale label is worth one line of diff.

The 100 rule beats the 1-point rule: a desktop score going from 100 to 99 is
flagged, not quiet. That pair used to contradict each other with no stated
order, so this is the order.

## Gate 3 — is the move bigger than the noise

For each flagged figure, compare how far it moved with `max` minus `min`, which
spans every single run of both sittings.

- Moved **further** than that range → **confirmed**.
- Moved **no further** → **Unconfirmed**. The individual runs wandered by as
  much as the figure appears to have changed.

A Lighthouse version difference skips gates 1 and 3. It is a label, not a
measurement, and it has no sittings or range to compare.

## The three outcomes

| Outcome         | When                                                       | What to do                    |
| --------------- | ---------------------------------------------------------- | ----------------------------- |
| **Held**        | Every figure steady and quiet                              | Change nothing. No PR.        |
| **Unconfirmed** | Any figure failed gate 1 or gate 3, and none passed gate 3 | Change nothing. No PR.        |
| **Moved**       | At least one figure confirmed at gate 3                    | Update the README, open a PR. |

Held is the normal outcome and a success. Unconfirmed is also a success: it is
the routine declining to publish a number it cannot stand behind, which is the
job.

## Every outcome: write the report

Before you finish, write what you found to `$RUNNER_TEMP/report.md`, using
the full path the workflow's prompt gives you: the
outcome, each figure that moved, by how much, and its spread this run. A step
after yours puts that file in the run summary, and for Held and Unconfirmed it
is the only place your reasoning survives — this action hides its own output,
and a run that opens no PR otherwise leaves nothing to read.

For Unconfirmed, name which gate each figure failed - the two sittings
disagreeing is a different problem from the individual runs wandering, and
only the first means the site served two different experiences fifteen minutes
apart. Then say what would settle it:

```bash
gh workflow run pageSpeed.yml -f measureOnly=true
```

That measures again and keeps the result without judging it or opening
anything. Two runs disagreeing is itself the answer.

If a tool you need is refused, say which one in the report rather than working
around it. The list of tools this workflow allows is a guess, and a refusal is
how it gets corrected.

## Moved: update the README

- Update the table, the date and the Lighthouse version in the
  "## Performance" section. Refresh **every** cell from this report, not only
  the confirmed ones: the table is one measurement taken on one date, and a
  mix of old and new figures under a single date would be a worse record than
  either.
- Update the prose under it so it still matches the numbers, including the LCP,
  CLS and TBT sentence. Every number it quotes is the one you carried forward
  from this report, even where that figure was quiet: rounding a measured 1.8s
  up to the 2.0s already written there is quoting last month. A figure that
  failed gate 1 has no number to carry, so leave its previous wording. Keep
  the voice: plain, specific, no marketing words.
- In the README, one sentence at most on what was confirmed: which changes are
  confirmed, and that any unconfirmed move is not claimed. A reader comparing
  two months of the table should not have to guess which numbers were trusted,
  but the README is a portfolio, not a log. The figure-by-figure detail -
  sittings, ranges and which gate each one failed - goes in the PR body, which
  #111 had to cut an eleven-line paragraph back to one sentence to fix.
- Quote the figure you carried forward from gate 1, not the average of the two
  sittings and not the better one.
- Leave the paragraph about the inlineCss change alone; it is history, not a
  current measurement.
- Do not touch `pageSpeed.json`, any other file, or any other part of the
  README.
- Commit on a branch named `chore/page-speed-<yyyy-mm-dd>`, dated from
  `measuredAt`, and open a PR with `gh pr create --assignee bcwatson22`, so it
  reaches the one person who reviews it whatever their watch settings say.
  - Don't check whether the branch exists first: push, and if the push or
    the PR is refused, stop there and put the error in the report. Never
    force-push, and never reuse or work around a branch that is already
    there.
  - Title: `docs: refresh the PageSpeed table for <Month Year>`.
  - Body: what moved, by how much, in which direction, **and both sittings
    plus the range behind each figure you are claiming moved**. Then your
    judgement on whether this
    looks like a change in the site or a change in how Google measures. Say
    plainly if you are unsure, and name anything you left as unconfirmed.
  - Hyphens, not em dashes, in the PR and the README.
  - No attribution trailers, and no test-plan checklist: the diff is four
    numbers and a sentence, and a checklist of things you did not do is noise
    in a repo whose PR bodies are prose.

## Always

Your shell is limited to `git checkout`, `git add`, `git commit`, `git push`,
`gh pr create` and `gh pr edit`. Anything else - printing the environment,
listing remotes or branches, `gh api`, `gh auth`, python - is refused, and
every refusal spends one of a fixed budget of turns. Two runs have run out of
turns that way before writing a report. Read files with the Read tool, and
don't look anything up that this file or the prompt already tells you.

You are measuring a live site you did not deploy, so never change application
code, and never present a regression as an improvement.

Never drop a sitting, drop a run or pick a different average to make a figure
publishable. The held frames already discarded are the only exception, and
the measurement made it, not you. If the measurement cannot support a claim, the outcome is
Unconfirmed, and that is the correct answer rather than a failure to produce
one. Three attempts at these rules have now failed by being too willing to
publish, and none by being too cautious.
