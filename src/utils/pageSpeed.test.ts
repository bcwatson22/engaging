import {
  bounds,
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
  omit?: 'score' | 'metric' | 'version';
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

  it('refuses a response with no metrics', async () => {
    const { fetcher, wait } = setup({ omit: 'metric' });

    await expect(
      measure('https://example.com', undefined, fetcher, wait),
    ).rejects.toThrow('largest-contentful-paint');
  });
});
