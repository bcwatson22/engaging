import { writeFile } from 'fs/promises';

import { measure } from '../utils/pageSpeed.ts';

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
  `Lighthouse ${report.lighthouseVersion}, median of ${report.runs} ` +
    `after ${report.warmUps} discarded warm-up run per page`,
);

/* The range in brackets after each median, because a local run is usually
   somebody checking whether a figure is trustworthy, and the median alone
   cannot answer that. */
for (const { page, strategy, scores, metrics, spread } of report.measurements)
  console.log(
    `${page} — ${strategy}: ` +
      `perf ${scores.performance} ` +
      `(${spread.scores.performance.min}–${spread.scores.performance.max}), ` +
      `a11y ${scores.accessibility}, ` +
      `bp ${scores['best-practices']}, seo ${scores.seo} ` +
      `(LCP ${(metrics.lcpMs / 1000).toFixed(1)}s, ` +
      `${(spread.metrics.lcpMs.min / 1000).toFixed(1)}–` +
      `${(spread.metrics.lcpMs.max / 1000).toFixed(1)}s; ` +
      `CLS ${metrics.clsScore.toFixed(2)}, TBT ${Math.round(metrics.tbtMs)}ms, ` +
      `${Math.round(spread.metrics.tbtMs.min)}–` +
      `${Math.round(spread.metrics.tbtMs.max)}ms)`,
  );
