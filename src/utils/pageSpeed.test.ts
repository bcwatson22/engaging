import { categories, measure, median, query } from './pageSpeed';

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
  /* One entry per request, in order. Twelve requests is four page/strategy
     pairs times three runs, so a test can describe a whole measurement as a
     list. Shorter lists repeat their last entry. */
  responses?: RunValues[];
  ok?: boolean;
  status?: number;
  omit?: 'score' | 'metric' | 'version';
};

const setup = ({ responses, ok = true, status = 200, omit }: Options = {}) => {
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
    } as Response);
  });

  return { fetcher };
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
    const { fetcher } = setup();

    const { measurements } = await measure(
      'https://example.com',
      undefined,
      fetcher,
    );

    expect(
      measurements.map(({ page, strategy }) => `${page} ${strategy}`),
    ).toEqual(['Home mobile', 'Home desktop', 'CV mobile', 'CV desktop']);
  });

  /* The injected fetch is for the tests; the script calls this with none, so
     the default has to reach the real global. */
  it('falls back to the global fetch', async () => {
    const { fetcher } = setup();
    vi.stubGlobal('fetch', fetcher);

    await measure('https://example.com');

    expect(fetcher).toHaveBeenCalledTimes(12);

    vi.unstubAllGlobals();
  });

  /* The README's central claim about its own numbers: each figure is the
     median of three runs, so one unusually good run cannot become the table. */
  it('publishes the median of three runs, not the best', async () => {
    const { fetcher } = setup({
      responses: [
        { performance: 0.93 },
        { performance: 1 },
        { performance: 0.97 },
      ],
    });

    const [home] = (await measure('https://example.com', undefined, fetcher))
      .measurements;

    expect(home?.scores.performance).toBe(97);
  });

  it('runs three times per page and strategy', async () => {
    const { fetcher } = setup();

    await measure('https://example.com', undefined, fetcher);

    expect(fetcher).toHaveBeenCalledTimes(12);
  });

  it('reports the metrics the prose quotes', async () => {
    const { fetcher } = setup({ responses: [{ lcpMs: 2600 }] });

    const [home] = (await measure('https://example.com', undefined, fetcher))
      .measurements;

    expect(home?.metrics).toEqual({ lcpMs: 2600, clsScore: 0, tbtMs: 40 });
  });

  it('records the Lighthouse version the numbers came from', async () => {
    const { fetcher } = setup();

    const report = await measure('https://example.com', undefined, fetcher);

    expect(report.lighthouseVersion).toBe('13.4.1');
  });

  /* Cosmetic, unlike a missing score: the version only labels the table, so a
     response without one is still a usable measurement. */
  it('says so when the response carries no version', async () => {
    const { fetcher } = setup({ omit: 'version' });

    const report = await measure('https://example.com', undefined, fetcher);

    expect(report.lighthouseVersion).toBe('unknown');
  });

  it('fails rather than publishing a partial measurement', async () => {
    const { fetcher } = setup({ ok: false, status: 429 });

    await expect(
      measure('https://example.com', undefined, fetcher),
    ).rejects.toThrow('429');
  });

  /* A missing score is not a zero — zero is a real and terrible score — so it
     has to stop the run rather than become a table entry. */
  it('refuses a response with no score', async () => {
    const { fetcher } = setup({ omit: 'score' });

    await expect(
      measure('https://example.com', undefined, fetcher),
    ).rejects.toThrow('performance');
  });

  it('refuses a response with no metrics', async () => {
    const { fetcher } = setup({ omit: 'metric' });

    await expect(
      measure('https://example.com', undefined, fetcher),
    ).rejects.toThrow('largest-contentful-paint');
  });
});
