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
   Two clusters is not scatter, so something switches between states rather than
   wobbling - but what, is not established. The LCP image is 23KB with its
   preload in the first 350 bytes of the document, while the document itself is
   322KB, which is over a second of transfer on the throttled profile mobile is
   scored against. A cold image cache was measured at 311ms once, and cannot
   account for 1.2s on its own.

   Until that is understood, this file's job is to notice the disagreement
   rather than publish whichever state it happened to catch. That holds however
   the cause turns out. */

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
   refuse to publish anything. Neither is right, and which is less wrong
   depends on a cause nobody has pinned down yet - so this stays as it is, and
   stays written down. */
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
    /* How fast the machine that ran the test was, by Lighthouse's own CPU
       benchmark, and anything it noticed was wrong with the run. */
    environment?: { benchmarkIndex?: number };
    runWarnings?: unknown[];
    categories?: Record<string, { score?: number | null } | undefined>;
    audits?: Record<
      string,
      | {
          numericValue?: number;
          /* The LCP element audit carries a second table breaking the metric
             into its four phases. Typed loosely because it is one shape among
             several the audit can return, and the reader below checks rather
             than assumes. */
          details?: { items?: unknown[] };
        }
      | undefined
    >;
  };
};

type Scores = Record<Category, number>;

/* The three the README's prose quotes alongside the table, so a change in the
   numbers can be explained rather than just reported. */
type Metrics = { lcpMs: number; clsScore: number; tbtMs: number };

/* Largest Contentful Paint, split the way Lighthouse splits it: how long the
   document took to start arriving, how long the browser waited before asking
   for the LCP resource, how long that resource took, and how long after
   arriving it took to paint.

   Recorded because the figure is bimodal and nothing so far says why. Home
   mobile reads 2.0s or 3.3s on the same commit, and the four phases say which
   part moves: load duration points at the image, time to first byte or render
   delay points at the 322KB document. Guessing between those two cost a day
   and produced a wrong answer that reached a merged README.

   Diagnostic only. The rules do not read it and no case is judged on it. */
type Phases = {
  ttfbMs: number;
  loadDelayMs: number;
  loadDurationMs: number;
  renderDelayMs: number;
};

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
  /* Absent when any run of the measurement did not report the breakdown.
     Partial phases would be worse than none: the four are only meaningful
     against each other. */
  phases?: Record<keyof Phases, Figure>;
  /* And when they are absent, what was there instead - so the next run
     answers the question rather than repeating it. */
  phasesMissing?: string;
  /* The element LCP chose in each counted run, one list per sitting. A list
     rather than a single name because it can change from run to run, and the
     change is the thing being looked for. */
  lcpElements: (string | null)[][];
  /* Per sitting, per counted run, so a slow sitting can be laid beside a
     fast one task by task. */
  mainThread: MainThread[][];
  /* Per sitting, per counted run, beside the main thread it ran. */
  hosts: Host[][];
  /* When no run could read the main-thread audits, what they held instead. */
  mainThreadMissing?: string;
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

/* The audit is lcp-breakdown-insight, which is where Lighthouse 13 keeps
   this. An earlier version of this reader looked in
   largest-contentful-paint-element and matched prose labels with regexes;
   both were wrong, and a live run reporting nothing is how that was found.

   Each row carries a `subpart` - a stable identifier - alongside the prose
   `label`, so the match is on the identifier. A renamed label is then a
   cosmetic change rather than a silent loss. */
const phaseSubparts: Record<keyof Phases, string> = {
  ttfbMs: 'timeToFirstByte',
  loadDelayMs: 'resourceLoadDelay',
  loadDurationMs: 'resourceLoadDuration',
  renderDelayMs: 'elementRenderDelay',
};

type PhaseRow = { subpart?: unknown; duration?: unknown };

const isRow = (row: unknown): row is PhaseRow =>
  typeof row === 'object' && row !== null;

/* Which element LCP settled on, as the breakdown audit names it beside its
   table. Recorded because LCP is the largest contentful paint, not the first:
   if a bigger element appears late, LCP moves to it and takes its paint time.
   On CV mobile the render delay spiked to 1.1s in one sitting before and
   after #100 removed the page-level boundary, and the question is whether
   that sitting was still measuring the logo or something larger revealed
   after it. */
const label = 120;

type NodeRow = { type?: unknown; nodeLabel?: unknown; selector?: unknown };

const elementOf = (response: Response): string | null => {
  const items =
    response.lighthouseResult?.audits?.['lcp-breakdown-insight']?.details
      ?.items ?? [];

  const node = items.find(
    (item): item is NodeRow => isRow(item) && (item as NodeRow).type === 'node',
  );

  const name = [node?.nodeLabel, node?.selector].find(
    (value): value is string => typeof value === 'string' && value !== '',
  );

  return name ? name.slice(0, label) : null;
};

/* Enough of the audit to recognise its shape, when the reader found nothing
   in it. The first attempt at phasesOf guessed the shape from memory and came
   back empty on a live run, which cost a 25-minute measurement and told us
   only that the guess was wrong. Rather than guess again, the measurement now
   carries what it saw. */
const sample = 600;

const shapeOf = (response: Response): string => {
  const audits = response.lighthouseResult?.audits ?? {};
  const named = Object.keys(audits).filter((key) =>
    /contentful|lcp/i.test(key),
  );

  if (named.length === 0) return 'no audit name matched /contentful|lcp/';

  return named
    .map(
      (key) =>
        `${key}: ${JSON.stringify(audits[key]?.details ?? null).slice(0, sample)}`,
    )
    .join('\n');
};

/* Returns null rather than throwing when the breakdown is absent, unlike
   every other reader here. A score that goes missing is a corrupt
   measurement and has to stop the run; a diagnostic that goes missing is a
   month without a clue, which is worth a quiet note and nothing more. */
/* An audit's rows, flattened one level. Lighthouse returns some details as a
   list of tables and some as a table, and the readers here should not care
   which: a nested table's rows and a flat table's rows come out the same. */
const flatten = (item: unknown): unknown[] => {
  if (!isRow(item)) return [item];

  const { items } = item as { items?: unknown[] };

  return Array.isArray(items) ? items : [item];
};

const rowsOf = (response: Response, audit: string): Record<string, unknown>[] =>
  (response.lighthouseResult?.audits?.[audit]?.details?.items ?? [])
    .flatMap(flatten)
    .filter(isRow) as Record<string, unknown>[];

const phasesOf = (response: Response): Phases | null => {
  const rows = rowsOf(response, 'lcp-breakdown-insight');

  const found = Object.entries(phaseSubparts).map(([name, subpart]) => {
    const row = rows.find((candidate) => candidate.subpart === subpart);

    return [
      name,
      typeof row?.duration === 'number' ? row.duration : undefined,
    ] as const;
  });

  if (found.some(([, timing]) => timing === undefined)) return null;

  return Object.fromEntries(found) as unknown as Phases;
};

/* What the main thread was doing, recorded because the remaining question
   about the LCP spikes is whether the paint waits on this page's own work or
   on PageSpeed's machine being busy for that one request. The element is in
   the initial HTML, visible and downloaded, and still takes up to two
   seconds to paint on mobile; a long task from the site's own script landing
   inside that wait would name the cause, and its absence would point away
   from the site altogether.

   Read tolerantly and backed by the raw audit, because the last three
   readers written from memory of Lighthouse's shapes were wrong on their
   first live run. */
type LongTask = { url: string; startMs: number | null; durationMs: number };

/* Enough to see what dominates without carrying every task of every run. */
const keep = 8;

const longTasksOf = (response: Response): LongTask[] =>
  rowsOf(response, 'long-tasks')
    .flatMap(({ url, startTime, duration }) =>
      typeof duration === 'number'
        ? [
            {
              url: typeof url === 'string' ? url : '',
              startMs: typeof startTime === 'number' ? startTime : null,
              durationMs: duration,
            },
          ]
        : [],
    )
    .sort((a, b) => b.durationMs - a.durationMs)
    .slice(0, keep);

/* Main-thread time by category: script evaluation, style and layout,
   painting, parsing, garbage collection. Whether a slow run spent its extra
   time in this page's script or spread evenly across everything is the
   difference between a fixable page and a busy host. */
const workOf = (response: Response): Record<string, number> =>
  Object.fromEntries(
    rowsOf(response, 'mainthread-work-breakdown').flatMap(
      ({ group, duration }) =>
        typeof group === 'string' && typeof duration === 'number'
          ? [[group, duration]]
          : [],
    ),
  );

/* The stretch of the load where the element had arrived and was waiting to
   paint, in the same observed timeline the long tasks are reported in. */
const windowOf = (phases: Phases | null): [number, number] | null => {
  if (!phases) return null;

  const start = phases.ttfbMs + phases.loadDelayMs + phases.loadDurationMs;

  return [start, start + phases.renderDelayMs];
};

const mainThreadAudits = ['long-tasks', 'mainthread-work-breakdown'];

const rawOf = (response: Response, audits: string[]): string =>
  audits
    .map(
      (audit) =>
        `${audit}: ${JSON.stringify(response.lighthouseResult?.audits?.[audit]?.details ?? null).slice(0, sample)}`,
    )
    .join('\n');

/* The machine Lighthouse ran on, as Lighthouse measured it.

   Nine local runs of Lighthouse 13.5.0 against the live site, with the same
   mobile emulation and throttling simulation PageSpeed uses, scored 99 every
   time with a render delay under 45ms, on a host benchmarking about 3,900.
   PageSpeed's slow sittings hold the paint for one to two seconds while the
   main thread sits idle - which is what starved compositor and raster
   threads look like, since they do the painting and never appear among the
   long tasks. If those sittings ran on hosts that benchmark low, or carry
   Lighthouse's slow-CPU warning, the variance belongs to PageSpeed's lab and
   not to this page. */
type Host = { benchmark: number | null; warnings: string[] };

const hostOf = (response: Response): Host => {
  const benchmark = response.lighthouseResult?.environment?.benchmarkIndex;

  return {
    benchmark: typeof benchmark === 'number' ? benchmark : null,
    warnings: (response.lighthouseResult?.runWarnings ?? []).filter(
      (warning): warning is string => typeof warning === 'string',
    ),
  };
};

type MainThread = {
  window: [number, number] | null;
  longTasks: LongTask[];
  work: Record<string, number>;
};

const mainThreadOf = (
  response: Response,
): { mainThread: MainThread; mainThreadShape: string | null } => {
  const longTasks = longTasksOf(response);
  const work = workOf(response);

  return {
    mainThread: { window: windowOf(phasesOf(response)), longTasks, work },
    mainThreadShape:
      longTasks.length === 0 && Object.keys(work).length === 0
        ? rawOf(response, mainThreadAudits)
        : null,
  };
};

const median = (values: number[]): number =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]!;

const bounds = (values: number[]): Bounds => ({
  min: Math.min(...values),
  max: Math.max(...values),
});

type Run = {
  scores: Scores;
  metrics: Metrics;
  phases: Phases | null;
  element: string | null;
  host: Host;
  mainThread: MainThread;
  /* Only set when neither main-thread reader found anything, to say why. */
  mainThreadShape: string | null;
  /* Only set when phases is null, and only to say why. */
  shape: string | null;
  version: string;
};

const metricNames = ['lcpMs', 'clsScore', 'tbtMs'] as const;

/* The order they happen in, which is the order worth reading them in. */
const phaseOrder = [
  'ttfbMs',
  'loadDelayMs',
  'loadDurationMs',
  'renderDelayMs',
] as const;

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

  /* One entry per run that could not read the breakdown, so the two branches
     below come from the same fact rather than two tests of it. */
  const unread = perSitting.flat().flatMap(({ shape }) => shape ?? []);
  const threadUnread = perSitting
    .flat()
    .flatMap(({ mainThreadShape }) => mainThreadShape ?? []);

  const phased = (phase: keyof Phases): number[][] =>
    perSitting.map((results) => results.map(({ phases }) => phases![phase]));

  return {
    page,
    strategy,
    scores: Object.fromEntries(
      categories.map((category) => [category, figureOf(scored(category))]),
    ) as Record<Category, Figure>,
    metrics: Object.fromEntries(
      metricNames.map((metric) => [metric, figureOf(timed(metric))]),
    ) as Record<keyof Metrics, Figure>,
    lcpElements: perSitting.map((results) =>
      results.map(({ element }) => element),
    ),
    mainThread: perSitting.map((results) =>
      results.map(({ mainThread }) => mainThread),
    ),
    hosts: perSitting.map((results) => results.map(({ host }) => host)),
    ...(threadUnread.length > 0 && { mainThreadMissing: threadUnread[0]! }),
    ...(unread.length === 0
      ? {
          phases: Object.fromEntries(
            phaseOrder.map((phase) => [phase, figureOf(phased(phase))]),
          ) as Record<keyof Phases, Figure>,
        }
      : { phasesMissing: unread[0]! }),
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
    phases: phasesOf(body),
    element: elementOf(body),
    host: hostOf(body),
    ...mainThreadOf(body),
    shape: phasesOf(body) === null ? shapeOf(body) : null,
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
  elementOf,
  hostOf,
  longTasksOf,
  rowsOf,
  windowOf,
  workOf,
  phaseOrder,
  phasesOf,
  shapeOf,
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
  Phases,
  LongTask,
  MainThread,
  Host,
  Figure,
  Bounds,
  Strategy,
  Category,
};
