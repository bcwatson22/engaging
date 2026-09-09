import type { TStatus } from '@/data/types/status';

import { endpoint, getStatus, revalidate } from './getStatus';

const record = {
  at: '2026-08-17T12:00:00.000Z',
  result: 'https://artifacts.example.com/billy-watson-cv.pdf',
  durationMs: 14_000,
  attempts: 3,
  elapsedMs: 49_000,
};

const check = {
  at: '2026-08-17T12:00:00.000Z',
  drifted: false,
  queued: false,
  stale: false,
};

const sweep = {
  at: '2026-08-17T12:00:00.000Z',
  checked: 12,
  problems: [
    {
      url: 'https://github.com/someone',
      status: 404,
      state: 'broken' as const,
    },
  ],
};

const status: TStatus = {
  links: sweep,
  artifacts: { 'cv-pdf': [record], 'startup-images': [] },
  integrity: { 'cv-pdf': check, 'startup-images': null },
  queue: { waiting: 0, pending: 0, dead: 0 },
};

type TOptions = {
  ok?: boolean;
  body?: unknown;
  rejects?: boolean;
};

const setup = ({
  ok = true,
  body = status,
  rejects = false,
}: TOptions = {}) => {
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(() =>
    rejects
      ? Promise.reject(new Error('unreachable'))
      : Promise.resolve({
          ok,
          json: () => Promise.resolve(body),
        } as Response),
  );

  vi.stubGlobal('fetch', fetch);

  return { fetch };
};

describe('getStatus', () => {
  beforeEach(() => vi.clearAllMocks());

  afterEach(() => vi.unstubAllGlobals());

  it('reads the status endpoint', async () => {
    const { fetch } = setup();

    await getStatus();

    expect(fetch.mock.calls[0][0]).toBe(endpoint);
  });

  it('revalidates on the same window the endpoint caches for', async () => {
    const { fetch } = setup();

    await getStatus();

    expect(fetch.mock.calls[0][1]).toMatchObject({ next: { revalidate } });
  });

  /* The service cold-boots in about twenty seconds. Nobody waits that long
     for a status page. */
  it('gives up rather than waiting for a sleeping service', async () => {
    const { fetch } = setup();

    await getStatus();

    expect(fetch.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it('returns what the service reported', async () => {
    setup();

    await expect(getStatus()).resolves.toEqual(status);
  });

  /* The service deploys separately, so a version predating the integrity
     check is a real thing to meet. Refusing to read it would turn a missing
     feature into "the service is not answering", which is a lie. */
  describe('a service too old to run integrity checks', () => {
    const older = { artifacts: status.artifacts, queue: status.queue };

    it('reports no sweep rather than none at all', async () => {
      setup({ body: older });

      await expect(getStatus()).resolves.toMatchObject({ links: null });
    });

    it('is still read', async () => {
      setup({ body: older });

      await expect(getStatus()).resolves.not.toBeNull();
    });

    it('reports no checks rather than none at all', async () => {
      setup({ body: older });

      await expect(getStatus()).resolves.toMatchObject({
        integrity: { 'cv-pdf': null, 'startup-images': null },
      });
    });
  });

  it('returns nothing when the service cannot be reached', async () => {
    setup({ rejects: true });

    await expect(getStatus()).resolves.toBeNull();
  });

  it('returns nothing when the service refuses', async () => {
    setup({ ok: false });

    await expect(getStatus()).resolves.toBeNull();
  });

  /* The service deploys separately, so an unrecognised shape is a real
     possibility rather than a defensive flourish — and rendering `undefined`
     into the page is worse than saying the status could not be read. */
  describe('rejects a response it does not recognise', () => {
    it.each([
      ['a string', 'nope'],
      ['null', null],
      ['no artifacts', { queue: status.queue, integrity: status.integrity }],
      [
        'no queue',
        { artifacts: status.artifacts, integrity: status.integrity },
      ],

      [
        'a sweep of the wrong shape',
        {
          artifacts: status.artifacts,
          integrity: status.integrity,
          links: { at: 'now' },
          queue: status.queue,
        },
      ],
      [
        'a sweep problem that is null',
        {
          artifacts: status.artifacts,
          integrity: status.integrity,
          links: { at: 'now', checked: 1, problems: [null] },
          queue: status.queue,
        },
      ],
      [
        'a sweep problem of the wrong shape',
        {
          artifacts: status.artifacts,
          integrity: status.integrity,
          links: { at: 'now', checked: 1, problems: [{ url: 1 }] },
          queue: status.queue,
        },
      ],
      [
        'a sweep that is not an object',
        {
          artifacts: status.artifacts,
          integrity: status.integrity,
          links: 'fine',
          queue: status.queue,
        },
      ],
      [
        'integrity that is not an object at all',
        {
          artifacts: status.artifacts,
          integrity: 'fine',
          queue: status.queue,
        },
      ],
      [
        'a check of the wrong shape',
        {
          artifacts: status.artifacts,
          integrity: { 'cv-pdf': { at: 'now' }, 'startup-images': null },
          queue: status.queue,
        },
      ],
      [
        'a check that is not an object',
        {
          artifacts: status.artifacts,
          integrity: { 'cv-pdf': 'fine', 'startup-images': null },
          queue: status.queue,
        },
      ],
      [
        'a missing artifact',
        { artifacts: { 'cv-pdf': null }, queue: status.queue },
      ],
      [
        'an artifact that is not a list',
        {
          artifacts: { 'cv-pdf': record, 'startup-images': [] },
          integrity: status.integrity,
          queue: status.queue,
        },
      ],
      [
        'a history entry that is not an object',
        {
          artifacts: { 'cv-pdf': ['nope'], 'startup-images': [] },
          integrity: status.integrity,
          queue: status.queue,
        },
      ],
      [
        'a history entry that is null',
        {
          artifacts: { 'cv-pdf': [null], 'startup-images': [] },
          integrity: status.integrity,
          queue: status.queue,
        },
      ],
      [
        'a record missing what the render cost',
        {
          artifacts: {
            'cv-pdf': [{ at: 'now', result: 'x' }],
            'startup-images': [],
          },
          queue: status.queue,
        },
      ],
    ])('%s', async (_label, body) => {
      setup({ body });

      await expect(getStatus()).resolves.toBeNull();
    });
  });

  /* The counts used to be demanded as a set, and when the service renamed
     them the whole payload was rejected — the page told visitors the service
     was not answering while it answered perfectly well. A count this version
     does not recognise is worth zero, not the entire page. */
  describe('a queue it only partly recognises', () => {
    it('reads an unknown count as zero rather than rejecting the response', async () => {
      setup({
        body: { ...status, queue: { waiting: 3, pending: 1, dead: 'lots' } },
      });

      await expect(getStatus()).resolves.toMatchObject({
        queue: { waiting: 3, pending: 1, dead: 0 },
      });
    });

    it('survives a service that reports counts this version has never heard of', async () => {
      setup({
        body: { ...status, queue: { waiting: 2, active: 1, delayed: 4 } },
      });

      await expect(getStatus()).resolves.toMatchObject({
        queue: { waiting: 2, pending: 0, dead: 0 },
      });
    });

    /* The rest of the response is the part worth keeping — it is where the
       render history lives. */
    it('still reports the history alongside it', async () => {
      setup({ body: { ...status, queue: {} } });

      await expect(getStatus()).resolves.toMatchObject({
        artifacts: status.artifacts,
      });
    });
  });
});
