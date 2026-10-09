/* Measures the four figures the README quotes: three runs per page and
   strategy, twice, with a gap between.

   Two sittings rather than one because the variance that matters turned out to
   be between them, not inside them. On 2026-10-09, 27 minutes apart on the
   same commit, Home mobile measured 99 with an LCP of 2.0s and then 91 with an
   LCP of 3.3s - and the three runs inside the second sitting agreed with each
   other to within a point. A routine reading one sitting sees three numbers
   nodding along and calls it evidence.

   Across four sittings that figure now reads 2.6s, 3.2s, 2.0s, 3.3s: two
   clusters about 1.2s apart, steady within a sitting and jumping between them.
   That is a cold edge cache on the LCP image rather than scatter, so the fix
   belongs in how the site serves it. Until that lands, this file's job is to
   notice the disagreement rather than publish whichever mode it happened to
   catch. */

const endpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

/* Three, matching what the README claims. An even count would need a rule for
   averaging the middle pair, and an average is exactly the thing a median is
   chosen to avoid. */
const runs = 3;

/* One run per page and strategy whose result is thrown away.

   The LCP element is an image served through /_next/image, and the difference
   between a warm edge cache and a cold one was measured at 20ms against
   311ms — on the one resource the metric is about. Nothing else requests that
   image for weeks at a time, so a monthly routine always arrives cold, and
   six measurements of unchanged code ranged from 90 to 100 depending on it.

   A warm-up costs four extra runs and about a minute, and it measures the
   page rather than the state of a cache nobody visiting the site would
   share.

   It is kept per sitting, and that is a deliberate tension: warming each
   sitting hides the cold mode that a real first visitor gets, which is a
   number worth knowing. Dropping the warm-up instead would put a cold run in
   every sitting and widen every spread permanently, so the routine would
   refuse to publish anything. Neither is right. The honest resolution is to
   stop the cold mode existing, which is a change to how the image is served,
   not to how it is measured. */
const warmUps = 1;

/* Two sittings, and the gap between them.

   Fifteen minutes is long enough that the second sitting is a separate
   question rather than the tail of the first, and short enough to fit a
   45-minute job alongside 32 API calls. It is a guess informed by one
   observation - 27 minutes caught both modes - so if two sittings start
   agreeing while the figure still wanders month to month, widen this before
   concluding the method works. */
const sittings = 2;
const gap = 15 * 60_000;

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

type Bounds = { min: number; max: number };

/* One figure - a score or a metric - as every run saw it.

   `sittings` holds one median per sitting, in order, and that pair is the
   thing a decision gets made on: two sittings agreeing is evidence, and two
   disagreeing is a reason to publish nothing. `min` and `max` span every run
   of every sitting, so they carry both kinds of disagreement at once.

   Per figure rather than one number per measurement, because the figures do
   not move together. A Total Blocking Time that tripled while every score held
   steady is the signature of a contended runner, and that is only visible one
   figure at a time. */
type Figure = Bounds & { sittings: number[] };

type Measurement = {
  page: PageName;
  strategy: Strategy;
  scores: Record<Category, Figure>;
  metrics: Record<keyof Metrics, Figure>;
};

type Report = {
  measuredAt: string;
  siteUrl: string;
  lighthouseVersion: string;
  /* Per sitting, not in total, and recorded so a reader of the JSON can tell
     these numbers apart from the ones measured under earlier rules. */
  runs: number;
  warmUps: number;
  sittings: number;
  gapMs: number;
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

const bounds = (values: number[]): Bounds => ({
  min: Math.min(...values),
  max: Math.max(...values),
});

type Run = { scores: Scores; metrics: Metrics; version: string };

const metricNames = ['lcpMs', 'clsScore', 'tbtMs'] as const;

/* A figure's median in each sitting, and its bounds across the lot. Both come
   from the same runs, which is the point: a median published without the
   disagreement behind it is a number nobody can question. */
const figureOf = (perSitting: number[][]): Figure => ({
  sittings: perSitting.map(median),
  ...bounds(perSitting.flat()),
});

/* Every sitting's runs for one page and strategy, in one measurement. */
const summarise = (
  page: PageName,
  strategy: Strategy,
  perSitting: Run[][],
): Measurement => {
  const scored = (category: Category): number[][] =>
    perSitting.map((results) => results.map(({ scores }) => scores[category]));

  const timed = (metric: keyof Metrics): number[][] =>
    perSitting.map((results) => results.map(({ metrics }) => metrics[metric]));

  return {
    page,
    strategy,
    scores: Object.fromEntries(
      categories.map((category) => [category, figureOf(scored(category))]),
    ) as Record<Category, Figure>,
    metrics: Object.fromEntries(
      metricNames.map((metric) => [metric, figureOf(timed(metric))]),
    ) as Record<keyof Metrics, Figure>,
  };
};

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
  /* Declared and assigned rather than a constructor parameter property: Node
     runs this file by stripping its types, and a parameter property is the one
     TypeScript feature that needs code emitted rather than text removed. The
     tests compile through SWC and never noticed. */
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'PageSpeedError';
    this.status = status;
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

/* Every page and strategy, in a fixed order both the sittings and the merge
   rely on. */
const pairs = pages.flatMap((page) =>
  strategies.map((strategy) => ({ ...page, strategy })),
);

/* One sitting: a discarded warm-up then the runs that count, for each pair.

   One request at a time. Sixteen runs take minutes and nothing is waiting on
   them, while firing them in parallel is how a free API key meets its rate
   limit - the same reasoning as the CV's link sweep. */
const sit = async (
  siteUrl: string,
  key: string | undefined,
  fetcher: Fetch,
  wait: Wait,
): Promise<Run[][]> => {
  const sitting: Run[][] = [];

  for (const { path, strategy } of pairs) {
    const results: Run[] = [];
    const url = `${siteUrl}${path}`;

    for (let warmUp = 0; warmUp < warmUps; warmUp++)
      await attempted(url, strategy, key, fetcher, wait);

    for (let attempt = 0; attempt < runs; attempt++)
      results.push(await attempted(url, strategy, key, fetcher, wait));

    sitting.push(results);
  }

  return sitting;
};

const measure = async (
  siteUrl: string,
  key?: string,
  fetcher: Fetch = globalThis.fetch,
  wait: Wait = pause,
): Promise<Report> => {
  const taken: Run[][][] = [];

  for (let sitting = 0; sitting < sittings; sitting++) {
    /* Before the second and any after it, never before the first. */
    if (sitting) await wait(gap);

    taken.push(await sit(siteUrl, key, fetcher, wait));
  }

  return {
    measuredAt: new Date().toISOString(),
    siteUrl,
    lighthouseVersion: taken[0]![0]![0]!.version,
    runs,
    warmUps,
    sittings,
    gapMs: gap,
    measurements: pairs.map(({ name, strategy }, pair) =>
      summarise(
        name,
        strategy,
        taken.map((sitting) => sitting[pair]!),
      ),
    ),
  };
};

export {
  bounds,
  gap,
  measure,
  median,
  pause,
  query,
  runs,
  sittings,
  warmUps,
  categories,
  metricNames,
  strategies,
  pages,
};
export type {
  Report,
  Measurement,
  Scores,
  Metrics,
  Figure,
  Bounds,
  Strategy,
  Category,
};
