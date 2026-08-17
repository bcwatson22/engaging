import { honeypotField } from '@/constants/contact';

import { endpoint, sendContact, type TPayload } from './sendContact';

type TOptions = {
  status?: number;
  body?: unknown;
  rejects?: boolean;
};

const payload: TPayload = {
  name: 'Tom Tollafield',
  email: 'tom@example.com',
  message: 'I would like to talk to you about a role.',
  [honeypotField]: '',
  renderedAt: 1_760_000_000_000,
};

const setup = ({ status = 202, body = {}, rejects = false }: TOptions = {}) => {
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(() =>
    rejects
      ? Promise.reject(new Error('network'))
      : Promise.resolve({
          ok: status >= 200 && status < 300,
          status,
          json: () => Promise.resolve(body),
        } as Response),
  );

  vi.stubGlobal('fetch', fetch);

  return { fetch };
};

/* fetch's own signature types init loosely, so the recorded call is narrowed
   once here rather than asserted at every use. */
type TSentRequest = { method: string; body: string };

const requestOf = (fetch: ReturnType<typeof vi.fn>): TSentRequest => {
  const [, init] = fetch.mock.calls[0] ?? [];

  if (!init) throw new Error('fetch was never called');

  return init as TSentRequest;
};

const bodyOf = (fetch: ReturnType<typeof vi.fn>): TPayload =>
  JSON.parse(requestOf(fetch).body) as TPayload;

describe('sendContact', () => {
  beforeEach(() => vi.clearAllMocks());

  afterEach(() => vi.unstubAllGlobals());

  it('posts to the contact endpoint', async () => {
    const { fetch } = setup();

    await sendContact(payload);

    expect(fetch.mock.calls[0][0]).toBe(endpoint);
    expect(requestOf(fetch).method).toBe('POST');
  });

  it('sends the whole payload, honeypot and timing included', async () => {
    const { fetch } = setup();

    await sendContact(payload);

    expect(bodyOf(fetch)).toEqual(payload);
  });

  it('reports an accepted message', async () => {
    setup();

    await expect(sendContact(payload)).resolves.toEqual({ outcome: 'sent' });
  });

  it('reports a rate-limited message', async () => {
    setup({ status: 429 });

    await expect(sendContact(payload)).resolves.toEqual({ outcome: 'limited' });
  });

  it('reports which fields the service rejected', async () => {
    setup({ status: 400, body: { fields: ['email'] } });

    await expect(sendContact(payload)).resolves.toEqual({
      outcome: 'invalid',
      fields: ['email'],
    });
  });

  it('reports a rejection that names no fields', async () => {
    setup({ status: 400, body: {} });

    await expect(sendContact(payload)).resolves.toEqual({
      outcome: 'invalid',
      fields: [],
    });
  });

  it('reports a failure rather than throwing at the caller', async () => {
    setup({ rejects: true });

    await expect(sendContact(payload)).resolves.toEqual({ outcome: 'failed' });
  });
});
