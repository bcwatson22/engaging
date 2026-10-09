---
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

Before you finish, write what you found to `$RUNNER_TEMP/report.md`: the
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
  CLS and TBT sentence. Keep its voice: plain, specific, no marketing words. Do
  not add a changelog of this run.
- Say in the prose which figures were confirmed and which were left
  unconfirmed, if any were. A reader comparing two months of the table should
  not have to guess which numbers were trusted.
- Quote the figure you carried forward from gate 1, not the average of the two
  sittings and not the better one.
- Leave the paragraph about the inlineCss change alone; it is history, not a
  current measurement.
- Do not touch `pageSpeed.json`, any other file, or any other part of the
  README.
- Commit on a branch named `chore/page-speed-<yyyy-mm>`, and open a PR with
  `gh pr create --assignee bcwatson22`, so it reaches the one person who
  reviews it whatever their watch settings say.
  - Title: `docs: refresh the PageSpeed table for <Month Year>`.
  - Body: what moved, by how much, in which direction, **and both sittings
    plus the range behind each figure you are claiming moved**. Then your
    judgement on whether this
    looks like a change in the site or a change in how Google measures. Say
    plainly if you are unsure, and name anything you left as unconfirmed.
  - No attribution trailers, and no test-plan checklist: the diff is four
    numbers and a sentence, and a checklist of things you did not do is noise
    in a repo whose PR bodies are prose.

## Always

You are measuring a live site you did not deploy, so never change application
code, and never present a regression as an improvement.

Never drop a sitting, drop a run or pick a different average to make a figure
publishable. If the measurement cannot support a claim, the outcome is
Unconfirmed, and that is the correct answer rather than a failure to produce
one. Three attempts at these rules have now failed by being too willing to
publish, and none by being too cautious.


# The README's current Performance section

## Performance

[PageSpeed Insights](https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.engaging.engineering), 26 August 2026, Lighthouse 13.4.1:

| Page                                               | Performance | Accessibility | Best Practices | SEO |
| -------------------------------------------------- | ----------- | ------------- | -------------- | --- |
| [Home](https://www.engaging.engineering/) — mobile | 97          | 100           | 100            | 100 |
| Home — desktop                                     | 100         | 100           | 100            | 100 |
| [CV](https://www.engaging.engineering/cv) — mobile | 99          | 100           | 100            | 100 |
| CV — desktop                                       | 100         | 100           | 100            | 100 |

Mobile is the number worth quoting: it is an emulated Moto G Power on throttled
4G, and it is what Google ranks on. Largest Contentful Paint is still the only
metric not at full marks there — 2.6s on Home, 2.0s on the CV — with everything
else passing comfortably (CLS 0 on both, Total Blocking Time around 40ms and
20ms).

Each figure is the median of three runs, taken after one discarded warm-up run
per page. A single run moves by a point or two either way, which is wide enough
to invent an improvement that is not there — and the warm-up matters more than
that: the LCP element is an image served through `/_next/image`, which took
311ms against a cold edge cache and about 20ms against a warm one. Six
measurements of unchanged code once ranged from 90 to 100 on that alone.

The warm-up narrowed that but did not close it. Two sittings 27 minutes apart
on the same commit later read 99 and 91 on Home mobile, with LCPs of 2.0s and
3.3s, and the three runs inside each sitting agreed with each other to within a
point. Across four sittings that figure reads 2.6s, 3.2s, 2.0s and 3.3s: two
clusters about 1.2s apart rather than scatter, so something switches between
states rather than wobbling. What, is still open: the LCP image is 23KB and
preloaded in the first 350 bytes, while the document is 322KB, which is itself
over a second of transfer on the profile mobile is scored against.

So the site is now measured twice with a gap, and each figure records both
sittings and the range across every run. A single sitting cannot be questioned;
two can disagree, and when they do the routine publishes nothing. It is
described under [Maintenance](#maintenance).

The mobile numbers moved from 93 and 94, measured the same way immediately
before the change, when the stylesheet stopped being a second request:
`experimental.inlineCss` puts it in the document, so the critical path is one
deep rather than two, and LCP came down by half a second on Home and nearly a
second on the CV.

These are lab numbers. Field data needs enough real traffic for the Chrome UX
Report to have a sample, and this domain does not have it, so there is nothing
to publish there yet.

Run it yourself with the link above rather than taking these on trust — and note
Chrome's own Lighthouse tab will disagree, mostly because it runs on your machine
and inside your extensions. PageSpeed Insights is the reproducible one.

# This month's pageSpeed.json

```json
{
  "measuredAt": "2026-11-01T06:04:11.000Z",
  "siteUrl": "https://www.engaging.engineering",
  "lighthouseVersion": "13.4.1",
  "runs": 3,
  "warmUps": 1,
  "sittings": 2,
  "gapMs": 900000,
  "measurements": [
    {
      "page": "Home",
      "strategy": "mobile",
      "scores": {
        "performance": {
          "sittings": [97, 97],
          "min": 97,
          "max": 97
        },
        "accessibility": {
          "sittings": [100, 100],
          "min": 100,
          "max": 100
        },
        "best-practices": {
          "sittings": [100, 100],
          "min": 100,
          "max": 100
        },
        "seo": {
          "sittings": [100, 100],
          "min": 100,
          "max": 100
        }
      },
      "metrics": {
        "lcpMs": {
          "sittings": [2600, 2600],
          "min": 2500,
          "max": 2700
        },
        "clsScore": {
          "sittings": [0, 0],
          "min": 0,
          "max": 0
        },
        "tbtMs": {
          "sittings": [40, 40],
          "min": 36,
          "max": 46
        }
      }
    },
    {
      "page": "Home",
      "strategy": "desktop",
      "scores": {
        "performance": {
          "sittings": [99, 99],
          "min": 97,
          "max": 100
        },
        "accessibility": {
          "sittings": [100, 100],
          "min": 100,
          "max": 100
        },
        "best-practices": {
          "sittings": [100, 100],
          "min": 100,
          "max": 100
        },
        "seo": {
          "sittings": [100, 100],
          "min": 100,
          "max": 100
        }
      },
      "metrics": {
        "lcpMs": {
          "sittings": [500, 500],
          "min": 400,
          "max": 600
        },
        "clsScore": {
          "sittings": [0, 0],
          "min": 0,
          "max": 0
        },
        "tbtMs": {
          "sittings": [8, 8],
          "min": 4,
          "max": 14
        }
      }
    },
    {
      "page": "CV",
      "strategy": "mobile",
      "scores": {
        "performance": {
          "sittings": [99, 99],
          "min": 99,
          "max": 99
        },
        "accessibility": {
          "sittings": [100, 100],
          "min": 100,
          "max": 100
        },
        "best-practices": {
          "sittings": [100, 100],
          "min": 100,
          "max": 100
        },
        "seo": {
          "sittings": [100, 100],
          "min": 100,
          "max": 100
        }
      },
      "metrics": {
        "lcpMs": {
          "sittings": [2000, 2000],
          "min": 1900,
          "max": 2100
        },
        "clsScore": {
          "sittings": [0, 0],
          "min": 0,
          "max": 0
        },
        "tbtMs": {
          "sittings": [20, 20],
          "min": 16,
          "max": 26
        }
      }
    },
    {
      "page": "CV",
      "strategy": "desktop",
      "scores": {
        "performance": {
          "sittings": [100, 100],
          "min": 100,
          "max": 100
        },
        "accessibility": {
          "sittings": [100, 100],
          "min": 100,
          "max": 100
        },
        "best-practices": {
          "sittings": [100, 100],
          "min": 100,
          "max": 100
        },
        "seo": {
          "sittings": [100, 100],
          "min": 100,
          "max": 100
        }
      },
      "metrics": {
        "lcpMs": {
          "sittings": [400, 400],
          "min": 300,
          "max": 500
        },
        "clsScore": {
          "sittings": [0, 0],
          "min": 0,
          "max": 0
        },
        "tbtMs": {
          "sittings": [9, 9],
          "min": 5,
          "max": 15
        }
      }
    }
  ]
}
```
