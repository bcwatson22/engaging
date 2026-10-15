import { writeFile } from 'fs/promises';

import { measure, phaseOrder } from '../utils/pageSpeed.ts';
import type { Figure, Host, MainThread, Visual } from '../utils/pageSpeed.ts';

/* Entry point for the monthly routine in .github/workflows/pageSpeed.yml. The
   measuring lives in utils, where it is tested; this only reads the
   environment, writes the file the workflow's Claude step reads, and fails
   loudly — unlike the snapshot script, a bad measurement must not quietly
   become a README claim. */

const siteUrl = process.env.SITE_URL ?? 'https://www.engaging.engineering';
const out = process.env.PAGESPEED_OUT ?? 'pageSpeed.json';
const indent = 2;

const report = await measure(siteUrl, process.env.PAGESPEED_API_KEY);

await writeFile(out, `${JSON.stringify(report, null, indent)}\n`);

console.log(
  `Lighthouse ${report.lighthouseVersion}, ${report.sittings} sittings of ` +
    `${report.runs} runs ${report.gapMs / 60_000} minutes apart, each after ` +
    `${report.warmUps} discarded warm-up run per page`,
);

/* Each sitting's median, then the range across every run of every sitting.
   Always both, including when they are identical: a local run is usually
   somebody asking whether a figure can be trusted, and "99/91 [90-100]" says
   no at a glance while "99" says nothing at all. */
const show = (
  { sittings, min, max }: Figure,
  as: (value: number) => string = (value) => String(Math.round(value)),
): string => `${sittings.map(as).join('/')} [${as(min)}-${as(max)}]`;

const seconds = (ms: number): string => `${(ms / 1000).toFixed(1)}s`;
const exact = (value: number): string => value.toFixed(2);

/* The LCP breakdown on its own line, because it is the diagnostic rather than
   the result: which phase differs between the two sittings is the question
   the bimodal figure has been waiting on. */
const breakdown = (phases: Record<string, Figure> | undefined): string =>
  phases
    ? `\n    LCP phases: ${phaseOrder
        .map(
          (phase) =>
            `${phase.replace('Ms', '')} ${show(phases[phase]!, seconds)}`,
        )
        .join(', ')}`
    : '';

/* Which element LCP chose, per sitting, with a count when runs disagree. The
   change from one sitting to the next is the clue, so it is printed even when
   every run agrees. */
const chosen = (sittings: (string | null)[][]): string =>
  '\n    LCP element: ' +
  sittings
    .map((runs, index) => {
      const counts = new Map<string, number>();

      for (const run of runs) {
        const name = run ?? 'not reported';
        counts.set(name, (counts.get(name) ?? 0) + 1);
      }

      return `sitting ${index + 1} ${[...counts]
        .map(([name, count]) => (count > 1 ? `${name} x${count}` : name))
        .join(', ')}`;
    })
    .join(' | ');

/* One line per counted run: the stretch where the LCP element had arrived and
   was waiting to paint, the longest task and whether it fell inside that
   stretch, and the two largest categories of main-thread work. The top two by
   size rather than named categories, because the names are Lighthouse's and
   this file has guessed Lighthouse's shapes wrong three times. */
const ms = (value: number): string => `${Math.round(value)}ms`;

const overlaps = (
  { startMs, durationMs }: MainThread['longTasks'][number],
  [from, to]: [number, number],
): boolean => startMs !== null && startMs < to && startMs + durationMs > from;

const host = (
  { benchmark, warnings }: Host | undefined = {
    benchmark: null,
    warnings: [],
  },
): string =>
  `host ${benchmark === null ? 'unbenchmarked' : Math.round(benchmark)}` +
  (warnings.length > 0
    ? `, ${warnings.length} warning(s): ${warnings.join(' / ').slice(0, 160)}`
    : '');

const thread = (sittings: MainThread[][], hosts: Host[][]): string =>
  sittings
    .flatMap((runs, sitting) =>
      runs.map(({ window, longTasks, work }, run) => {
        const longest = longTasks[0];
        const waiting = window
          ? `waiting ${ms(window[0])}-${ms(window[1])}`
          : 'no wait recorded';
        const task = longest
          ? `longest task ${ms(longest.durationMs)}` +
            (longest.startMs === null ? '' : ` at ${ms(longest.startMs)}`) +
            ` from ${longest.url.split('/').pop() || 'unattributed'}` +
            (window && overlaps(longest, window) ? ', INSIDE the wait' : '')
          : 'no long tasks';
        const top = Object.entries(work)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 2)
          .map(([group, value]) => `${group} ${ms(value)}`)
          .join(', ');

        return `\n    sitting ${sitting + 1} run ${run + 1}: ${host(hosts[sitting]?.[run])}; ${waiting}; ${task}; ${top || 'no work breakdown'}`;
      }),
    )
    .join('');

/* One line per counted run of what the screen did: when text first painted
   against when the LCP did, when parsing finished, the filmstrip as
   time, size and fingerprint, and what the page fetched late. A stalled run
   with an early first contentful paint is the portrait being held; one where
   that waits too is the whole frame. */
const paint = (paints: Visual['paints'], name: string, as: string): string =>
  name in paints ? `${as} ${ms(paints[name]!)}` : `${as} -`;

const screen = (sittings: Visual[][]): string =>
  sittings
    .flatMap((runs, sitting) =>
      runs.map(({ paints, frames, late }, run) => {
        const timings = [
          paint(paints, 'firstContentfulPaint', 'FCP'),
          paint(paints, 'largestContentfulPaint', 'LCP'),
          paint(paints, 'domContentLoaded', 'DCL'),
        ].join(', ');
        const film = frames
          .map(
            ({ ms: at, bytes, id }) =>
              `${ms(at)}:${Math.round(bytes / 1024)}k:${id}`,
          )
          .join(' ');
        const fetched = late
          .map(
            ({ url, startMs, endMs }) =>
              `${url}@${ms(startMs)}` + (endMs === null ? '' : `-${ms(endMs)}`),
          )
          .join(', ');

        return `\n    sitting ${sitting + 1} run ${run + 1} screen: ${timings}; frames ${film || 'none'}; late ${fetched || 'none'}`;
      }),
    )
    .join('');

const missing = (why: string | undefined): string =>
  why ? `\n    LCP phases: not reported. The audit held: ${why}` : '';

for (const {
  page,
  strategy,
  scores,
  metrics,
  phases,
  phasesMissing,
  lcpElements,
  mainThread,
  mainThreadMissing,
  hosts,
  visuals,
  visualMissing,
} of report.measurements)
  console.log(
    `${page} - ${strategy}: ` +
      `perf ${show(scores.performance)}, ` +
      `a11y ${show(scores.accessibility)}, ` +
      `bp ${show(scores['best-practices'])}, ` +
      `seo ${show(scores.seo)} ` +
      `(LCP ${show(metrics.lcpMs, seconds)}, ` +
      `CLS ${show(metrics.clsScore, exact)}, ` +
      `TBT ${show(metrics.tbtMs)}ms)` +
      breakdown(phases) +
      missing(phasesMissing) +
      chosen(lcpElements) +
      thread(mainThread, hosts) +
      (mainThreadMissing
        ? `\n    main thread: not reported. The audits held: ${mainThreadMissing}`
        : '') +
      screen(visuals) +
      (visualMissing
        ? `\n    screen: not reported. The audits held: ${visualMissing}`
        : ''),
  );
