import type { TStatus } from '@/data/types/status';

import { endpoint, getStatus, revalidate } from './getStatus';

const record = {
  at: '2026-08-17T12:00:00.000Z',
  result: 'https://artifacts.example.com/billy-watson-cv.pdf',
  durationMs: 14_000,
  attempts: 3,
  elapsedMs: 49_000,
};

const status: TStatus = {
  artifacts: { 'cv-pdf': [record], 'startup-images': [] },
  queue: { waiting: 0, active: 0, delayed: 0, failed: 0 },
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
      ['no artifacts', { queue: status.queue }],
      ['no queue', { artifacts: status.artifacts }],
      [
        'a missing artifact',
        { artifacts: { 'cv-pdf': null }, queue: status.queue },
      ],
      [
        'an artifact that is not a list',
        {
          artifacts: { 'cv-pdf': record, 'startup-images': [] },
          queue: status.queue,
        },
      ],
      [
        'a history entry that is not an object',
        {
          artifacts: { 'cv-pdf': ['nope'], 'startup-images': [] },
          queue: status.queue,
        },
      ],
      [
        'a history entry that is null',
        {
          artifacts: { 'cv-pdf': [null], 'startup-images': [] },
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
      [
        'a count that is not a number',
        {
          artifacts: status.artifacts,
          queue: { ...status.queue, failed: 'lots' },
        },
      ],
    ])('%s', async (_label, body) => {
      setup({ body });

      await expect(getStatus()).resolves.toBeNull();
    });
  });
});
