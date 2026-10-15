import {
  bounds,
  elementOf,
  hostOf,
  longTasksOf,
  rowsOf,
  windowOf,
  workOf,
  phasesOf,
  shapeOf,
  categories,
  gap,
  measure,
  median,
  pause,
  query,
  sittings,
} from './pageSpeed';

type RunValues = {
  performance?: number;
  lcpMs?: number;
};

/* A response carrying only what the reader takes from it. Scores go in as the
   0–1 Lighthouse reports rather than the 0–100 the README quotes, so the test
   would notice the conversion disappearing. */
const body = ({ performance = 0.97, lcpMs = 2600 }: RunValues = {}) => ({
  lighthouseResult: {
    lighthouseVersion: '13.4.1',
    environment: { benchmarkIndex: 1540 },
    runWarnings: [
      'The tested device appears to have a slower CPU than expected.',
    ],
    categories: {
      performance: { score: performance },
      accessibility: { score: 1 },
      'best-practices': { score: 1 },
      seo: { score: 1 },
    },
    audits: {
      'largest-contentful-paint': { numericValue: lcpMs },
      'cumulative-layout-shift': { numericValue: 0 },
      'total-blocking-time': { numericValue: 40 },
      'long-tasks': {
        details: {
          items: [
            {
              url: 'https://example.com/_next/chunk.js',
              startTime: 600,
              duration: 900,
            },
            {
              url: 'https://example.com/other.js',
              startTime: 100,
              duration: 80,
            },
          ],
        },
      },
      'mainthread-work-breakdown': {
        details: {
          items: [
            { group: 'scriptEvaluation', duration: 1200 },
            { group: 'styleLayout', duration: 300 },
          ],
        },
      },
      /* As lcp-breakdown-insight returns it: a list whose first entry is
         the subpart table. */
      'lcp-breakdown-insight': {
        details: {
          type: 'list',
          items: [
            {
              type: 'table',
              items: [
                { subpart: 'timeToFirstByte', duration: 210 },
                { subpart: 'resourceLoadDelay', duration: 40 },
                { subpart: 'resourceLoadDuration', duration: 300 },
                { subpart: 'elementRenderDelay', duration: 150 },
              ],
            },
            {
              type: 'node',
              nodeLabel: 'Portrait of Engaging Engineering',
              selector: 'article.mugshot img',
              snippet: '<img ...>',
            },
          ],
        },
      },
    },
  },
});

type Options = {
  /* One entry per request, in order. Thirty-two requests is two sittings of
     four page/strategy pairs, each a warm-up plus three counted runs, so a
     test can describe a whole measurement as a list. Shorter lists repeat
     their last entry. */
  responses?: RunValues[];
  ok?: boolean;
  status?: number;
  /* What a refused request answers with. Google sends JSON; a proxy or an
     error page does not. */
  errorBody?: string;
  omit?: 'score' | 'metric' | 'version' | 'phases' | 'thread';
};

const setup = ({
  responses,
  ok = true,
  status = 200,
  errorBody = '{"error":{"message":"API key not valid"}}',
  omit,
}: Options = {}) => {
  let call = 0;

  const fetcher = vi.fn<typeof globalThis.fetch>().mockImplementation(() => {
    const values = responses?.[Math.min(call, responses.length - 1)] ?? {};
    call++;

    const payload: { lighthouseResult: Record<string, unknown> } = body(values);

    if (omit === 'score') delete payload.lighthouseResult.categories;
    if (omit === 'metric') delete payload.lighthouseResult.audits;
    if (omit === 'version') delete payload.lighthouseResult.lighthouseVersion;
    if (omit === 'thread') {
      const audits = payload.lighthouseResult.audits as Record<string, unknown>;
      delete audits['long-tasks'];
      delete audits['mainthread-work-breakdown'];
    }
    if (omit === 'phases')
      delete (payload.lighthouseResult.audits as Record<string, unknown>)[
        'lcp-breakdown-insight'
      ];

    return Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(payload),
      text: () => Promise.resolve(errorBody),
    } as Response);
  });

  /* Retries are real seconds in production and none here, so a test of the
     giving-up path costs nothing. */
  const wait = vi.fn<(ms: number) => Promise<void>>().mockResolvedValue();

  return { fetcher, wait };
};

describe('median', () => {
  it('takes the middle of three', () => {
    expect(median([99, 97, 98])).toBe(98);
  });

  /* Sorting a copy: the caller's array is reused for the next category. */
  it('leaves its input alone', () => {
    const values = [99, 97, 98];

    median(values);

    expect(values).toEqual([99, 97, 98]);
  });
});

/* Read straight from the response rather than through measure, because the
   shapes worth testing are the malformed ones: Lighthouse returns a list of
   tables whose contents vary by run, and the breakdown has to be ignored
   rather than trusted when it is not there. */
describe('phasesOf', () => {
  /* The shape a live run returned on 2026-10-13, trimmed. The identifiers and
     the two keys are what matter: an earlier reader looked for `phase` and
     `timing` in largest-contentful-paint-element and found nothing. */
  const audit = (items: unknown[]) => ({
    lighthouseResult: {
      audits: { 'lcp-breakdown-insight': { details: { type: 'list', items } } },
    },
  });

  const table = {
    type: 'table',
    headings: [
      { label: 'Subpart', key: 'label', valueType: 'text' },
      { label: 'Duration', key: 'duration', valueType: 'ms' },
    ],
    items: [
      {
        duration: 9.247,
        subpart: 'timeToFirstByte',
        label: 'Time to first byte',
      },
      {
        subpart: 'resourceLoadDelay',
        duration: 650.719,
        label: 'Resource load delay',
      },
      {
        subpart: 'resourceLoadDuration',
        duration: 287.358,
        label: 'Resource load duration',
      },
      {
        subpart: 'elementRenderDelay',
        label: 'Element render delay',
        duration: 22.647,
      },
    ],
  };

  it('reads the four subparts out of the nested table', () => {
    expect(phasesOf(audit([table, { snippet: '<img ...>' }]))).toEqual({
      ttfbMs: 9.247,
      loadDelayMs: 650.719,
      loadDurationMs: 287.358,
      renderDelayMs: 22.647,
    });
  });

  /* The identifier is the contract, not the prose beside it. */
  it('ignores the label entirely', () => {
    const relabelled = {
      ...table,
      items: table.items.map((row) => ({ ...row, label: 'Renamed by Google' })),
    };

    expect(phasesOf(audit([relabelled]))?.loadDelayMs).toBe(650.719);
  });

  it('ignores entries that are not tables', () => {
    expect(phasesOf(audit([null, 'a string', 7, table]))?.ttfbMs).toBe(9.247);
  });

  /* All four or none: they are only meaningful against each other. */
  it('gives nothing when a subpart is missing', () => {
    expect(
      phasesOf(audit([{ ...table, items: table.items.slice(1) }])),
    ).toBeNull();
  });

  it('gives nothing when a duration is not a number', () => {
    const broken = {
      ...table,
      items: table.items.map((row) =>
        row.subpart === 'elementRenderDelay'
          ? { ...row, duration: 'n/a' }
          : row,
      ),
    };

    expect(phasesOf(audit([broken]))).toBeNull();
  });

  it('gives nothing when the audit is absent', () => {
    expect(phasesOf({ lighthouseResult: { audits: {} } })).toBeNull();
  });
});

/* The reader guessed the audit's name and its keys from memory, and a live
   run came back empty twice over. This is what turns a third wrong guess into
   a sentence in the next run's output. */
describe('shapeOf', () => {
  it('quotes the details of every audit that might have held it', () => {
    const described = shapeOf({
      lighthouseResult: {
        audits: {
          'lcp-breakdown-insight': {
            details: { items: [{ subpart: 'somethingNew', duration: 1 }] },
          },
          'total-blocking-time': { numericValue: 40 },
        },
      },
    });

    expect(described).toContain('lcp-breakdown-insight');
    expect(described).toContain('somethingNew');
    expect(described).not.toContain('total-blocking-time');
  });

  it('copes with a response carrying no audits at all', () => {
    expect(shapeOf({})).toBe('no audit name matched /contentful|lcp/');
  });

  it('says so when no audit looks like the right one', () => {
    expect(shapeOf({ lighthouseResult: { audits: { seo: {} } } })).toBe(
      'no audit name matched /contentful|lcp/',
    );
  });
});

describe('elementOf', () => {
  const audit = (items: unknown[]) => ({
    lighthouseResult: {
      audits: { 'lcp-breakdown-insight': { details: { items } } },
    },
  });

  it('names the element by its label', () => {
    expect(
      elementOf(
        audit([{ type: 'table' }, { type: 'node', nodeLabel: 'Logo' }]),
      ),
    ).toBe('Logo');
  });

  /* A node with no accessible label still has a selector, which is enough to
     find it in the page. */
  it('falls back to the selector', () => {
    expect(
      elementOf(
        audit([{ type: 'node', nodeLabel: '', selector: 'header img' }]),
      ),
    ).toBe('header img');
  });

  it('gives nothing when the audit names no element', () => {
    expect(elementOf(audit([{ type: 'table' }, null, 'text']))).toBeNull();
    expect(elementOf({})).toBeNull();
  });

  /* A paragraph's label is its text, which can run to hundreds of words. */
  it('keeps a long label short enough to read in a log', () => {
    const long = 'word '.repeat(80);

    expect(elementOf(audit([{ type: 'node', nodeLabel: long }]))?.length).toBe(
      120,
    );
  });
});

describe('rowsOf', () => {
  /* A list of tables and a flat table should read the same. */
  it('flattens a nested table and passes a flat one through', () => {
    const nested = {
      lighthouseResult: {
        audits: {
          a: { details: { items: [{ items: [{ x: 1 }, { x: 2 }] }] } },
        },
      },
    };
    const flat = {
      lighthouseResult: { audits: { a: { details: { items: [{ x: 1 }] } } } },
    };

    expect(rowsOf(nested, 'a')).toEqual([{ x: 1 }, { x: 2 }]);
    expect(rowsOf(flat, 'a')).toEqual([{ x: 1 }]);
    expect(rowsOf({}, 'a')).toEqual([]);
  });
});

describe('longTasksOf', () => {
  const audit = (items: unknown[]) => ({
    lighthouseResult: { audits: { 'long-tasks': { details: { items } } } },
  });

  it('keeps the longest first', () => {
    const tasks = longTasksOf(
      audit([
        { url: 'a.js', startTime: 10, duration: 60 },
        { url: 'b.js', startTime: 20, duration: 400 },
      ]),
    );

    expect(tasks.map(({ url }) => url)).toEqual(['b.js', 'a.js']);
  });

  /* A task with no attribution is still a task; one with no start time can
     still be compared on size. Only one with no duration is unusable. */
  it('tolerates missing attribution and start time, and drops a row with no duration', () => {
    expect(
      longTasksOf(
        audit([{ duration: 70 }, { url: 'x.js', startTime: 5 }, null]),
      ),
    ).toEqual([{ url: '', startMs: null, durationMs: 70 }]);
  });

  it('keeps no more than eight', () => {
    const many = Array.from({ length: 12 }, (_, index) => ({
      url: `${index}.js`,
      startTime: index,
      duration: 50 + index,
    }));

    expect(longTasksOf(audit(many))).toHaveLength(8);
  });
});

describe('workOf', () => {
  it('maps each category to its time, and skips rows that are not one', () => {
    expect(
      workOf({
        lighthouseResult: {
          audits: {
            'mainthread-work-breakdown': {
              details: {
                items: [
                  { group: 'scriptEvaluation', duration: 900 },
                  { group: 'other' },
                  { duration: 40 },
                ],
              },
            },
          },
        },
      }),
    ).toEqual({ scriptEvaluation: 900 });
  });
});

describe('windowOf', () => {
  it('spans from the element arriving to it being painted', () => {
    expect(
      windowOf({
        ttfbMs: 10,
        loadDelayMs: 300,
        loadDurationMs: 90,
        renderDelayMs: 1000,
      }),
    ).toEqual([400, 1400]);
  });

  it('is absent without a breakdown', () => {
    expect(windowOf(null)).toBeNull();
  });
});

describe('hostOf', () => {
  it('reads the benchmark and the warnings', () => {
    expect(
      hostOf({
        lighthouseResult: {
          environment: { benchmarkIndex: 3900 },
          runWarnings: ['slow CPU', 42, null],
        },
      }),
    ).toEqual({ benchmark: 3900, warnings: ['slow CPU'] });
  });

  /* An unbenchmarked run is reported as such, not as a fast or slow one. */
  it('leaves the benchmark empty when Lighthouse did not record one', () => {
    expect(hostOf({})).toEqual({ benchmark: null, warnings: [] });
    expect(
      hostOf({
        lighthouseResult: { environment: { benchmarkIndex: undefined } },
      }),
    ).toEqual({ benchmark: null, warnings: [] });
  });
});

describe('bounds', () => {
  it('reports the range the runs covered', () => {
    expect(bounds([99, 97, 100])).toEqual({ min: 97, max: 100 });
  });

  /* Three identical runs are the only evidence that a figure is stable, so
     they have to read as a range of nothing rather than as a missing one. */
  it('reports no range when every run agreed', () => {
    expect(bounds([100, 100, 100])).toEqual({ min: 100, max: 100 });
  });
});

/* The real gap between attempts, which every other test replaces with a stub
   so a giving-up path costs no wall-clock seconds. */
describe('pause', () => {
  it('resolves once the time has passed', async () => {
    vi.useFakeTimers();

    const waited = pause(10_000);
    vi.advanceTimersByTime(10_000);

    await expect(waited).resolves.toBeUndefined();

    vi.useRealTimers();
  });
});

describe('query', () => {
  it('asks for every category the table reports', () => {
    const asked = new URL(query('https://example.com/', 'mobile')).searchParams;

    expect(asked.getAll('category')).toEqual([...categories]);
    expect(asked.get('strategy')).toBe('mobile');
  });

  /* The key is optional so a local run works without one; unauthenticated
     calls are rate-limited rather than refused. */
  it('includes a key only when there is one', () => {
    expect(query('https://example.com/', 'mobile')).not.toContain('key=');
    expect(query('https://example.com/', 'mobile', 'abc')).toContain('key=abc');
  });
});

describe('measure', () => {
  it('reports both pages on both strategies', async () => {
    const { fetcher, wait } = setup();

    const { measurements } = await measure(
      'https://example.com',
      undefined,
      fetcher,
      wait,
    );

    expect(
      measurements.map(({ page, strategy }) => `${page} ${strategy}`),
    ).toEqual(['Home mobile', 'Home desktop', 'CV mobile', 'CV desktop']);
  });

  /* The injected fetch is for the tests; the script calls this with none, so
     the default has to reach the real global. */
  it('falls back to the global fetch', async () => {
    const { fetcher, wait } = setup();
    vi.stubGlobal('fetch', fetcher);

    await measure('https://example.com', undefined, undefined, wait);

    expect(fetcher).toHaveBeenCalledTimes(32);

    vi.unstubAllGlobals();
  });

  /* The README's central claim about its own numbers: each figure is the
     median of three runs, so one unusually good run cannot become the table. */
  it('publishes the median of three runs, not the best', async () => {
    const { fetcher, wait } = setup({
      responses: [
        { performance: 0.93 },
        { performance: 1 },
        { performance: 0.97 },
      ],
    });

    const [home] = (
      await measure('https://example.com', undefined, fetcher, wait)
    ).measurements;

    expect(home?.scores.performance.sittings[0]).toBe(97);
  });

  /* Two sittings of four pairs, each a discarded warm-up plus three counted. */
  it('runs three times per page and strategy, twice, after a warm-up', async () => {
    const { fetcher, wait } = setup();

    await measure('https://example.com', undefined, fetcher, wait);

    expect(fetcher).toHaveBeenCalledTimes(32);
  });

  /* The whole reason for two sittings. On 2026-10-09 the same commit measured
     Home mobile at 99 and then 91 twenty-seven minutes later, and the three
     runs inside each sitting agreed with each other. A figure has to carry
     both medians, or the disagreement that matters is the one nobody sees. */
  it('keeps each sitting separate rather than pooling them', async () => {
    const quick = Array.from({ length: 16 }, () => ({
      performance: 0.99,
      lcpMs: 2000,
    }));
    const slow = Array.from({ length: 16 }, () => ({
      performance: 0.91,
      lcpMs: 3300,
    }));

    const { fetcher, wait } = setup({ responses: [...quick, ...slow] });

    const [home] = (
      await measure('https://example.com', undefined, fetcher, wait)
    ).measurements;

    expect(home?.scores.performance.sittings).toEqual([99, 91]);
    expect(home?.scores.performance).toMatchObject({ min: 91, max: 99 });
    expect(home?.metrics.lcpMs.sittings).toEqual([2000, 3300]);
  });

  /* Sequential sittings with no gap would be one long sitting, which is the
     thing being measured away from. */
  it('waits between sittings, and not before the first', async () => {
    const { fetcher, wait } = setup();

    await measure('https://example.com', undefined, fetcher, wait);

    expect(wait).toHaveBeenNthCalledWith(1, gap);
    expect(wait).toHaveBeenCalledTimes(sittings - 1);
  });

  /* The warm-up exists because the first request pays for a cold image cache:
     20ms warm against 311ms cold, on the element the metric is about. Its
     result has to be thrown away, or it is just a fourth run dragging the
     median back down. */
  it('throws the warm-up away rather than counting it', async () => {
    const { fetcher, wait } = setup({
      responses: [
        { performance: 0.5 },
        { performance: 0.99 },
        { performance: 0.99 },
        { performance: 0.99 },
      ],
    });

    const [home] = (
      await measure('https://example.com', undefined, fetcher, wait)
    ).measurements;

    expect(home?.scores.performance.sittings[0]).toBe(99);
    expect(home?.scores.performance.min).toBe(99);
  });

  /* The median alone let #78 publish a desktop score of 69 that the next run
     measured at 100. The bounds are what make that answerable rather than
     arguable, so they travel with every figure, not just the volatile ones. */
  it('records the range behind every median, not just the median', async () => {
    const { fetcher, wait } = setup({
      responses: [
        /* The warm-up, thrown away - so its 0.5 must not reach the range. */
        { performance: 0.5 },
        { performance: 0.94, lcpMs: 2000 },
        { performance: 1, lcpMs: 3200 },
        { performance: 0.97, lcpMs: 2600 },
      ],
    });

    const [home] = (
      await measure('https://example.com', undefined, fetcher, wait)
    ).measurements;

    expect(home?.scores.performance.sittings[0]).toBe(97);
    expect(home?.scores.performance).toMatchObject({ min: 94, max: 100 });
    expect(home?.metrics.lcpMs).toMatchObject({ min: 2000, max: 3200 });
    expect(home?.scores.seo).toMatchObject({ min: 100, max: 100 });
  });

  it('reports the metrics the prose quotes', async () => {
    const { fetcher, wait } = setup({ responses: [{ lcpMs: 2600 }] });

    const [home] = (
      await measure('https://example.com', undefined, fetcher, wait)
    ).measurements;

    expect(home?.metrics.lcpMs.sittings).toEqual([2600, 2600]);
    expect(home?.metrics.clsScore.sittings).toEqual([0, 0]);
    expect(home?.metrics.tbtMs.sittings).toEqual([40, 40]);
  });

  it('records the Lighthouse version the numbers came from', async () => {
    const { fetcher, wait } = setup();

    const report = await measure(
      'https://example.com',
      undefined,
      fetcher,
      wait,
    );

    expect(report.lighthouseVersion).toBe('13.4.1');
  });

  /* Cosmetic, unlike a missing score: the version only labels the table, so a
     response without one is still a usable measurement. */
  it('says so when the response carries no version', async () => {
    const { fetcher, wait } = setup({ omit: 'version' });

    const report = await measure(
      'https://example.com',
      undefined,
      fetcher,
      wait,
    );

    expect(report.lighthouseVersion).toBe('unknown');
  });

  it('fails rather than publishing a partial measurement', async () => {
    const { fetcher } = setup({ ok: false, status: 429 });

    await expect(
      measure('https://example.com', undefined, fetcher),
    ).rejects.toThrow('429');
  });

  /* Nobody watches a monthly run, so the one line it leaves has to say what
     to fix. A 403 alone does not distinguish a key the project never enabled
     from one restricted to a referrer. */
  it('reports what the API said, not just the status', async () => {
    const { fetcher } = setup({ ok: false, status: 403 });

    await expect(
      measure('https://example.com', undefined, fetcher),
    ).rejects.toThrow('API key not valid');
  });

  /* Lighthouse drives a real browser against a live site. The first real run
     of this died on net::ERR_TIMED_OUT loading the CV, taking eleven good
     runs down with it. */
  it('retries a run that failed for a reason the next one might not', async () => {
    let call = 0;
    const wait = vi.fn<(ms: number) => Promise<void>>().mockResolvedValue();
    const fetcher = vi.fn<typeof globalThis.fetch>().mockImplementation(() => {
      call++;

      if (call === 1)
        return Promise.resolve({
          ok: false,
          status: 400,
          text: () => Promise.resolve('{"error":{"message":"ERR_TIMED_OUT"}}'),
        } as Response);

      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(body()),
        text: () => Promise.resolve(''),
      } as unknown as Response);
    });

    const report = await measure(
      'https://example.com',
      undefined,
      fetcher,
      wait,
    );

    expect(report.measurements).toHaveLength(4);
    expect(fetcher).toHaveBeenCalledTimes(33);
    /* The retry, then the gap before the second sitting. */
    expect(wait).toHaveBeenCalledTimes(2);
  });

  it('gives up on a run that keeps failing', async () => {
    const { fetcher, wait } = setup({ ok: false, status: 500 });

    await expect(
      measure('https://example.com', undefined, fetcher, wait),
    ).rejects.toThrow('500');

    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  /* A refused key or an exhausted quota is a settled answer, and asking twice
     more only spends the quota that is already gone. */
  it('does not retry a refused key', async () => {
    const { fetcher, wait } = setup({ ok: false, status: 403 });

    await expect(
      measure('https://example.com', undefined, fetcher, wait),
    ).rejects.toThrow('403');

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(wait).not.toHaveBeenCalled();
  });

  /* JSON, but not Google's shape — a proxy or a gateway in front of it. */
  it('falls back to the raw body when the JSON carries no message', async () => {
    const { fetcher } = setup({
      ok: false,
      status: 403,
      errorBody: '{"denied":"by policy"}',
    });

    await expect(
      measure('https://example.com', undefined, fetcher),
    ).rejects.toThrow('denied');
  });

  it('falls back to the raw body when it is not the JSON Google sends', async () => {
    const { fetcher, wait } = setup({
      ok: false,
      status: 502,
      errorBody: '<html>Bad gateway</html>',
    });

    await expect(
      measure('https://example.com', undefined, fetcher, wait),
    ).rejects.toThrow('Bad gateway');
  });

  /* A missing score is not a zero — zero is a real and terrible score — so it
     has to stop the run rather than become a table entry. */
  it('refuses a response with no score', async () => {
    const { fetcher, wait } = setup({ omit: 'score' });

    await expect(
      measure('https://example.com', undefined, fetcher, wait),
    ).rejects.toThrow('performance');
  });

  /* The figure this exists to explain is bimodal, and the four phases say
     which part of it moves. They travel per sitting like everything else, so
     two sittings can be compared phase by phase. */
  it('records the LCP breakdown per sitting', async () => {
    const { fetcher, wait } = setup();

    const [home] = (
      await measure('https://example.com', undefined, fetcher, wait)
    ).measurements;

    expect(home?.phases?.ttfbMs.sittings).toEqual([210, 210]);
    expect(home?.phases?.loadDurationMs.sittings).toEqual([300, 300]);
    expect(home?.phases?.renderDelayMs).toMatchObject({ min: 150, max: 150 });
  });

  /* Unlike a missing score, which is a corrupt measurement. A month without
     the diagnostic is a month without a clue, not a reason to publish
     nothing. */
  /* LCP is the largest paint, not the first, so the element can change from
     one run to the next. One name per counted run, one list per sitting, so
     a change shows up as a change. */
  it('records which element LCP chose in every counted run', async () => {
    const { fetcher, wait } = setup();

    const [home] = (
      await measure('https://example.com', undefined, fetcher, wait)
    ).measurements;

    expect(home?.lcpElements).toEqual([
      Array(3).fill('Portrait of Engaging Engineering'),
      Array(3).fill('Portrait of Engaging Engineering'),
    ]);
  });

  /* The question this exists to answer: in a slow sitting, did a long task
     from the page's own script land inside the wait between the LCP element
     arriving and being painted. The window and the tasks travel together. */
  it('records the main thread beside the LCP wait, per run', async () => {
    const { fetcher, wait } = setup();

    const [home] = (
      await measure('https://example.com', undefined, fetcher, wait)
    ).measurements;
    const [first] = home?.mainThread[0] ?? [];

    expect(home?.mainThread).toHaveLength(2);
    expect(home?.mainThread[1]).toHaveLength(3);
    expect(first?.window).toEqual([550, 700]);
    expect(first?.longTasks[0]).toEqual({
      url: 'https://example.com/_next/chunk.js',
      startMs: 600,
      durationMs: 900,
    });
    expect(first?.work).toEqual({ scriptEvaluation: 1200, styleLayout: 300 });
    expect(home?.mainThreadMissing).toBeUndefined();
  });

  /* The readers were written from memory, as three before them were and got
     wrong. When they find nothing, the measurement says what was there. */
  /* Whether the slow sittings ran on slow machines is the question this
     answers, so the host travels per run beside everything else. */
  it('records the host each run used', async () => {
    const { fetcher, wait } = setup();

    const [home] = (
      await measure('https://example.com', undefined, fetcher, wait)
    ).measurements;

    expect(home?.hosts).toHaveLength(2);
    expect(home?.hosts[1]?.[2]).toEqual({
      benchmark: 1540,
      warnings: [
        'The tested device appears to have a slower CPU than expected.',
      ],
    });
  });

  it('records the raw audits when the main thread cannot be read', async () => {
    const { fetcher, wait } = setup({ omit: 'thread' });

    const [home] = (
      await measure('https://example.com', undefined, fetcher, wait)
    ).measurements;

    expect(home?.mainThread[0]?.[0]?.longTasks).toEqual([]);
    expect(home?.mainThreadMissing).toContain('long-tasks: null');
    expect(home?.mainThreadMissing).toContain(
      'mainthread-work-breakdown: null',
    );
  });

  it('still measures when the breakdown is missing', async () => {
    const { fetcher, wait } = setup({ omit: 'phases' });

    const [home] = (
      await measure('https://example.com', undefined, fetcher, wait)
    ).measurements;

    expect(home?.scores.performance.sittings).toEqual([97, 97]);
    expect(home?.phases).toBeUndefined();
  });

  it('refuses a response with no metrics', async () => {
    const { fetcher, wait } = setup({ omit: 'metric' });

    await expect(
      measure('https://example.com', undefined, fetcher, wait),
    ).rejects.toThrow('largest-contentful-paint');
  });
});
