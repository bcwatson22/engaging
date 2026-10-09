import { writeFile } from 'fs/promises';

import { measure } from '../utils/pageSpeed.ts';
import type { Figure } from '../utils/pageSpeed.ts';

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

for (const { page, strategy, scores, metrics } of report.measurements)
  console.log(
    `${page} - ${strategy}: ` +
      `perf ${show(scores.performance)}, ` +
      `a11y ${show(scores.accessibility)}, ` +
      `bp ${show(scores['best-practices'])}, ` +
      `seo ${show(scores.seo)} ` +
      `(LCP ${show(metrics.lcpMs, seconds)}, ` +
      `CLS ${show(metrics.clsScore, exact)}, ` +
      `TBT ${show(metrics.tbtMs)}ms)`,
  );
