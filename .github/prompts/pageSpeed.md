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

Per page and strategy:

- `scores` and `metrics` — the median of three runs, after a discarded warm-up.
  These are the figures the README quotes.
- `spread` — the lowest and highest of those same three runs, for every figure.

**The spread is the measurement disagreeing with itself**, and it decides
almost everything here. A 6-point drop means nothing if the three runs behind
it ranged over 8 points; the same drop means a great deal if they ranged over
one.

This exists because the rules once lacked it. For two months a 2-point move
counted as a real change while identical code measured Home mobile at 90, 91,
97, 99 and 100. #78 published a desktop score of 69 on those rules and said in
its own PR body that it did not believe it, because there was no way to say so
and still follow them. There is now.

## Step 1 — which figures are worth looking at

A figure is **quiet**, and you can ignore it, when:

- a category score moved by 1 point or less
- LCP moved by less than 0.2s
- CLS or TBT moved without altering what the prose claims

A figure is **flagged**, and goes to step 2, when:

- a category score moved by 2 points or more
- LCP moved by 0.2s or more
- it reached or left 100
- the quoted Lighthouse major version is not the one in the report

The 100 rule beats the 1-point rule: a desktop score going from 100 to 99 is
flagged, not quiet. That pair used to contradict each other with no stated
order, so this is the order.

## Step 2 — does this run agree with itself

For each flagged figure, compare how far it moved with that same figure's
spread in this report (`max` minus `min`).

- Moved **further** than its spread → **confirmed**. The three runs agreed with
  each other more closely than the figure has changed, so the change is
  evidence.
- Moved **no further** than its spread → **unconfirmed**. The runs disagreed
  among themselves by as much as the apparent change, so this report cannot
  tell you whether the site moved or the measurement did.

A Lighthouse version difference is always confirmed. It is a label, not a
measurement, and it has no spread.

## The three outcomes

| Outcome         | When                                 | What to do                    |
| --------------- | ------------------------------------ | ----------------------------- |
| **Held**        | Nothing flagged                      | Change nothing. No PR.        |
| **Unconfirmed** | Something flagged, nothing confirmed | Change nothing. No PR.        |
| **Moved**       | At least one figure confirmed        | Update the README, open a PR. |

Held is the normal outcome and a success. Unconfirmed is also a success: it is
the routine declining to publish a number it cannot stand behind, which is the
job.

## Every outcome: write the report

Before you finish, write what you found to `$RUNNER_TEMP/report.md`: the
outcome, each figure that moved, by how much, and its spread this run. A step
after yours puts that file in the run summary, and for Held and Unconfirmed it
is the only place your reasoning survives — this action hides its own output,
and a run that opens no PR otherwise leaves nothing to read.

For Unconfirmed, say in the report what would settle it:

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
  CLS and TBT sentence. Keep its voice: plain, specific, no marketing words. Do
  not add a changelog of this run.
- Say in the prose which figures were confirmed and which moved within their
  own spread, if any did. A reader comparing two months of the table should not
  have to guess which numbers were trusted.
- Leave the paragraph about the inlineCss change alone; it is history, not a
  current measurement.
- Do not touch `pageSpeed.json`, any other file, or any other part of the
  README.
- Commit on a branch named `chore/page-speed-<yyyy-mm>`, and open a PR with
  `gh pr create --assignee bcwatson22`, so it reaches the one person who
  reviews it whatever their watch settings say.
  - Title: `docs: refresh the PageSpeed table for <Month Year>`.
  - Body: what moved, by how much, in which direction, **and the spread behind
    each figure you are claiming moved**. Then your judgement on whether this
    looks like a change in the site or a change in how Google measures. Say
    plainly if you are unsure, and name anything you left as unconfirmed.
  - No attribution trailers, and no test-plan checklist: the diff is four
    numbers and a sentence, and a checklist of things you did not do is noise
    in a repo whose PR bodies are prose.

## Always

You are measuring a live site you did not deploy, so never change application
code, and never present a regression as an improvement.

Never widen a spread, drop a run or pick a different average to make a figure
publishable. If the measurement cannot support a claim, the outcome is
Unconfirmed, and that is the correct answer rather than a failure to produce
one.
