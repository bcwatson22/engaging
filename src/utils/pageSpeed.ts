/* Measures the four figures the README quotes, the way the README says they
   were measured: the median of three runs per page and strategy.

   The median matters more than it looks. A single PageSpeed run moves by a
   point or two either way, so a routine that published one run would invent
   improvements and regressions that are not there — and this file exists to
   keep a table honest, not to fill it. */

const endpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

/* Three, matching what the README claims. An even count would need a rule for
   averaging the middle pair, and an average is exactly the thing a median is
   chosen to avoid. */
const runs = 3;

const categories = [
  'performance',
  'accessibility',
  'best-practices',
  'seo',
] as const;

const strategies = ['mobile', 'desktop'] as const;

/* Enough of an unparseable body to identify it, without pasting a Google
   error page into a workflow log. */
const limit = 200;

/* Attempts per run, and the gap between them. Ten seconds because the failure
   this handles is a page that did not load in time, and asking again
   immediately asks the same busy moment. */
const tries = 3;
const retryDelay = 10_000;

const pages = [
  { name: 'Home', path: '/' },
  { name: 'CV', path: '/cv' },
] as const;

type Category = (typeof categories)[number];
type Strategy = (typeof strategies)[number];
type PageName = (typeof pages)[number]['name'];

/* Only the fields this reads. The full response is megabytes of audit detail,
   and typing the parts we ignore would be a schema to maintain for nothing. */
type Response = {
  lighthouseResult?: {
    lighthouseVersion?: string;
    categories?: Record<string, { score?: number | null } | undefined>;
    audits?: Record<string, { numericValue?: number } | undefined>;
  };
};

type Scores = Record<Category, number>;

/* The three the README's prose quotes alongside the table, so a change in the
   numbers can be explained rather than just reported. */
type Metrics = { lcpMs: number; clsScore: number; tbtMs: number };

type Measurement = {
  page: PageName;
  strategy: Strategy;
  scores: Scores;
  metrics: Metrics;
};

type Report = {
  measuredAt: string;
  siteUrl: string;
  lighthouseVersion: string;
  runs: number;
  measurements: Measurement[];
};

type Fetch = typeof globalThis.fetch;

const query = (url: string, strategy: Strategy, key?: string): string => {
  const params = new URLSearchParams({ url, strategy });

  for (const category of categories) params.append('category', category);
  if (key) params.set('key', key);

  return `${endpoint}?${params.toString()}`;
};

/* Lighthouse reports a score as 0–1, and a missing category as null. A missing
   score is not zero — zero is a real, terrible score — so it fails loudly
   rather than quietly publishing a nought. */
const scoreOf = (response: Response, category: Category): number => {
  const score = response.lighthouseResult?.categories?.[category]?.score;

  if (typeof score !== 'number')
    throw new Error(`No ${category} score in the response`);

  return Math.round(score * 100);
};

const metricOf = (response: Response, audit: string): number => {
  const value = response.lighthouseResult?.audits?.[audit]?.numericValue;

  if (typeof value !== 'number')
    throw new Error(`No ${audit} value in the response`);

  return value;
};

const median = (values: number[]): number =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]!;

type Run = { scores: Scores; metrics: Metrics; version: string };

/* Google says why in the body, and the status alone does not: a 403 is a key
   the project has not enabled, a key restricted to a referrer, or a key that
   has been revoked, and they are fixed in three different places. Nobody is
   watching a monthly run, so the log line it leaves has to be enough to act
   on a month later. */
const reasonFrom = (body: string): string => {
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } };

    return parsed.error?.message ?? body.slice(0, limit);
  } catch {
    return body.slice(0, limit);
  }
};

/* Carries the status so the retry can tell a bad run from a bad key without
   reading the message back out of a string. */
class PageSpeedError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'PageSpeedError';
  }
}

/* Lighthouse drives a real browser against a live site, so a run fails from
   time to time for reasons the next one will not repeat — the first attempt
   here died on net::ERR_TIMED_OUT loading the CV. Refusing the key, exhausting
   the quota or asking for a URL Google will not accept are settled answers,
   and asking again only wastes the machine and the quota. */
const isTransient = (error: unknown): boolean =>
  !(error instanceof PageSpeedError) || ![401, 403, 429].includes(error.status);

const run = async (
  url: string,
  strategy: Strategy,
  key: string | undefined,
  fetcher: Fetch,
): Promise<Run> => {
  const response = await fetcher(query(url, strategy, key));

  if (!response.ok)
    throw new PageSpeedError(
      response.status,
      `PageSpeed answered ${response.status} for ${url}: ` +
        reasonFrom(await response.text()),
    );

  const body = (await response.json()) as Response;

  return {
    scores: Object.fromEntries(
      categories.map((category) => [category, scoreOf(body, category)]),
    ) as Scores,
    metrics: {
      lcpMs: metricOf(body, 'largest-contentful-paint'),
      clsScore: metricOf(body, 'cumulative-layout-shift'),
      tbtMs: metricOf(body, 'total-blocking-time'),
    },
    version: body.lighthouseResult?.lighthouseVersion ?? 'unknown',
  };
};

type Wait = (ms: number) => Promise<void>;

const pause: Wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* Retries the run itself rather than the whole measurement, so one bad load
   costs seconds instead of the eleven good runs around it. Three attempts,
   because a page that will not load twice in a row is a page worth failing
   over rather than measuring. */
const attempted = async (
  url: string,
  strategy: Strategy,
  key: string | undefined,
  fetcher: Fetch,
  wait: Wait,
): Promise<Run> => {
  for (let attempt = 1; ; attempt++) {
    try {
      return await run(url, strategy, key, fetcher);
    } catch (error) {
      if (attempt >= tries || !isTransient(error)) throw error;

      await wait(retryDelay);
    }
  }
};

/* One request at a time. Twelve runs take minutes and nothing is waiting on
   them, while firing them in parallel is how a free API key meets its rate
   limit — the same reasoning as the CV's link sweep. */
const measure = async (
  siteUrl: string,
  key?: string,
  fetcher: Fetch = globalThis.fetch,
  wait: Wait = pause,
): Promise<Report> => {
  const measurements: Measurement[] = [];
  let lighthouseVersion = 'unknown';

  for (const page of pages) {
    for (const strategy of strategies) {
      const results: Run[] = [];

      for (let attempt = 0; attempt < runs; attempt++)
        results.push(
          await attempted(
            `${siteUrl}${page.path}`,
            strategy,
            key,
            fetcher,
            wait,
          ),
        );

      lighthouseVersion = results[0]!.version;

      measurements.push({
        page: page.name,
        strategy,
        scores: Object.fromEntries(
          categories.map((category) => [
            category,
            median(results.map(({ scores }) => scores[category])),
          ]),
        ) as Scores,
        metrics: {
          lcpMs: median(results.map(({ metrics }) => metrics.lcpMs)),
          clsScore: median(results.map(({ metrics }) => metrics.clsScore)),
          tbtMs: median(results.map(({ metrics }) => metrics.tbtMs)),
        },
      });
    }
  }

  return {
    measuredAt: new Date().toISOString(),
    siteUrl,
    lighthouseVersion,
    runs,
    measurements,
  };
};

export { measure, median, pause, query, runs, categories, strategies, pages };
export type { Report, Measurement, Scores, Metrics, Strategy, Category };
