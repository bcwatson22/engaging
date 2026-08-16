import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ContactForm, honeypotField, messages } from './ContactForm';

type TOptions = {
  status?: number;
  body?: unknown;
  rejects?: boolean;
};

const filled = {
  name: 'Tom Tollafield',
  email: 'tom@example.com',
  message: 'I would like to talk to you about a role.',
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

  return { ...render(<ContactForm />), user: userEvent.setup(), fetch };
};

/* Fills the three real fields; the honeypot is left alone, since a person
   never touches it. */
const complete = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByRole('textbox', { name: /name/i }), filled.name);
  await user.type(
    screen.getByRole('textbox', { name: /email/i }),
    filled.email,
  );
  await user.type(
    screen.getByRole('textbox', { name: /message/i }),
    filled.message,
  );
};

const submit = async (user: ReturnType<typeof userEvent.setup>) =>
  await user.click(screen.getByRole('button', { name: /send/i }));

const bodyOf = (fetch: ReturnType<typeof vi.fn>) =>
  JSON.parse(fetch.mock.calls[0][1].body);

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('names the form for assistive technology', () => {
    setup();

    expect(
      screen.getByRole('region', { name: /get in touch/i }),
    ).toBeInTheDocument();
  });

  it('offers the address as a fallback that needs no server', () => {
    setup();

    expect(
      screen.getByRole('link', { name: /hello@engaging.engineering/i }),
    ).toBeInTheDocument();
  });

  it('keeps the honeypot out of the accessibility tree', () => {
    setup();

    expect(
      screen.queryByRole('textbox', { name: /leave this empty/i }),
    ).not.toBeInTheDocument();
  });

  it('sends what was typed', async () => {
    const { user, fetch } = setup();

    await complete(user);
    await submit(user);

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    expect(bodyOf(fetch)).toMatchObject(filled);
  });

  it('sends an empty honeypot for a form a person filled in', async () => {
    const { user, fetch } = setup();

    await complete(user);
    await submit(user);

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    expect(bodyOf(fetch)[honeypotField]).toBe('');
  });

  it('reports when the message has been accepted', async () => {
    const { user } = setup();

    await complete(user);
    await submit(user);

    expect(await screen.findByText(messages.sent)).toBeInTheDocument();
  });

  it('moves focus to the outcome, so it is not announced into nowhere', async () => {
    const { user } = setup();

    await complete(user);
    await submit(user);

    await waitFor(() => expect(screen.getByText(messages.sent)).toHaveFocus());
  });

  it('disables the button while sending, so it cannot be double-submitted', async () => {
    const { user } = setup();

    await complete(user);

    const button = screen.getByRole('button', { name: /send/i });

    await user.click(button);

    await waitFor(() => expect(button).toBeEnabled());
  });

  it('explains a rate-limited submission', async () => {
    const { user } = setup({ status: 429 });

    await complete(user);
    await submit(user);

    expect(await screen.findByText(messages.limited)).toBeInTheDocument();
  });

  it('explains a rejected submission', async () => {
    const { user } = setup({ status: 400, body: { fields: ['email'] } });

    await complete(user);
    await submit(user);

    expect(await screen.findByText(messages.invalid)).toBeInTheDocument();
  });

  it('marks the fields the service rejected', async () => {
    const { user } = setup({ status: 400, body: { fields: ['email'] } });

    await complete(user);
    await submit(user);

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: /email/i })).toHaveAttribute(
        'aria-invalid',
        'true',
      ),
    );
  });

  it('leaves the fields the service accepted unmarked', async () => {
    const { user } = setup({ status: 400, body: { fields: ['email'] } });

    await complete(user);
    await submit(user);

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: /name/i })).toHaveAttribute(
        'aria-invalid',
        'false',
      ),
    );
  });

  it('still explains a rejection that names no fields', async () => {
    const { user } = setup({ status: 400, body: {} });

    await complete(user);
    await submit(user);

    expect(await screen.findByText(messages.invalid)).toBeInTheDocument();
  });

  it('falls back to the address when the service cannot be reached', async () => {
    const { user } = setup({ rejects: true });

    await complete(user);
    await submit(user);

    expect(await screen.findByText(messages.failed)).toBeInTheDocument();
  });

  it('says nothing before anything has been submitted', () => {
    setup();

    expect(screen.queryByText(messages.sent)).not.toBeInTheDocument();
    expect(screen.queryByText(messages.failed)).not.toBeInTheDocument();
  });
});
