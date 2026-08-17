import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  honeypotField,
  messages,
  minMessage,
  patternMessage,
} from '@/constants/contact';
import { sendContact, type TResult } from '@/data/functions/sendContact';

import { Contact } from './Contact';

/* The underlying function, not global fetch: the component and the hook are
   the things under test, and mocking one layer down keeps the assertions
   about what a person did rather than about a Response shape. */
vi.mock('@/data/functions/sendContact', () => ({
  sendContact:
    vi.fn<typeof import('@/data/functions/sendContact').sendContact>(),
}));

const filled = {
  name: 'Tom Tollafield',
  email: 'tom@example.com',
  message: 'I would like to talk to you about a role.',
};

const setup = ({ result = { outcome: 'sent' } as TResult } = {}) => {
  vi.mocked(sendContact).mockResolvedValue(result);

  return { ...render(<Contact />), user: userEvent.setup() };
};

const field = (name: RegExp) => screen.getByRole('textbox', { name });

const complete = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(field(/name/i), filled.name);
  await user.type(field(/email/i), filled.email);
  await user.type(field(/message/i), filled.message);
};

const submit = async (user: ReturnType<typeof userEvent.setup>) =>
  await user.click(screen.getByRole('button', { name: /send/i }));

const errorOf = (name: RegExp): string | null =>
  field(name).getAttribute('aria-describedby');

describe('Contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

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

  it('says nothing about a field nobody has visited yet', () => {
    setup();

    expect(field(/email/i)).toHaveAttribute('aria-invalid', 'false');
    expect(errorOf(/email/i)).toBeNull();
  });

  describe('validation once a field has been touched', () => {
    it('says nothing while a field is still being typed into', async () => {
      const { user } = setup();

      await user.type(field(/email/i), 'tom@');

      expect(field(/email/i)).toHaveAttribute('aria-invalid', 'false');
    });

    it('marks a required field left empty', async () => {
      const { user } = setup();

      await user.click(field(/name/i));
      await user.tab();

      expect(field(/name/i)).toHaveAttribute('aria-invalid', 'true');
    });

    it('describes the field with its own error, not the shared status', async () => {
      const { user } = setup();

      await user.click(field(/name/i));
      await user.tab();

      const described = errorOf(/name/i);

      expect(described).not.toBeNull();
      expect(document.getElementById(described!)).toBeInTheDocument();
    });

    it('clears the error as it is corrected, without waiting for a blur', async () => {
      const { user } = setup();

      await user.type(field(/email/i), 'tom@');
      await user.tab();

      expect(field(/email/i)).toHaveAttribute('aria-invalid', 'true');

      await user.type(field(/email/i), 'example.com');

      expect(field(/email/i)).toHaveAttribute('aria-invalid', 'false');
    });

    it('marks it again as it is broken, once touched', async () => {
      const { user } = setup();

      await user.type(field(/email/i), filled.email);
      await user.tab();
      await user.clear(field(/email/i));

      expect(field(/email/i)).toHaveAttribute('aria-invalid', 'true');
    });

    it('rejects an address with no top-level domain, which the service would refuse', async () => {
      const { user } = setup();

      await user.type(field(/email/i), 'tom@example');
      await user.tab();

      expect(field(/email/i)).toHaveAttribute('aria-invalid', 'true');
    });

    it('explains what an address should look like, rather than the browser default', async () => {
      const { user } = setup();

      await user.type(field(/email/i), 'tom@example');
      await user.tab();

      expect(screen.getByText(patternMessage)).toBeInTheDocument();
    });

    it('accepts a full address', async () => {
      const { user } = setup();

      await user.type(field(/email/i), filled.email);
      await user.tab();

      expect(field(/email/i)).toHaveAttribute('aria-invalid', 'false');
    });

    /* Asserted as a constraint rather than by typing something short: jsdom
       does not implement minlength validation, so a browser would mark this
       and the test environment would not. The attribute is what a browser
       acts on, and what must stay in step with the service. */
    it('declares the shortest message the service will accept', () => {
      setup();

      expect(field(/message/i)).toHaveAttribute(
        'minlength',
        String(minMessage),
      );
    });
  });

  describe('submitting', () => {
    it('sends nothing when the form is not valid', async () => {
      const { user } = setup();

      await submit(user);

      expect(sendContact).not.toHaveBeenCalled();
    });

    it('marks every bad field on submit, including untouched ones', async () => {
      const { user } = setup();

      await submit(user);

      await waitFor(() =>
        expect(field(/message/i)).toHaveAttribute('aria-invalid', 'true'),
      );
    });

    it('moves focus to the first field needing attention', async () => {
      const { user } = setup();

      await submit(user);

      await waitFor(() => expect(field(/name/i)).toHaveFocus());
    });

    it('sends what was typed', async () => {
      const { user } = setup();

      await complete(user);
      await submit(user);

      await waitFor(() =>
        expect(sendContact).toHaveBeenNthCalledWith(1, {
          ...filled,
          [honeypotField]: '',
          renderedAt: expect.any(Number),
        }),
      );
    });
  });

  describe('outcomes', () => {
    it('reports when the message has been accepted', async () => {
      const { user } = setup();

      await complete(user);
      await submit(user);

      expect(await screen.findByText(messages.sent)).toBeInTheDocument();
    });

    it('empties the form once it has been sent', async () => {
      const { user } = setup();

      await complete(user);
      await submit(user);

      await waitFor(() => expect(field(/message/i)).toHaveValue(''));
    });

    it('does not mark the emptied fields as invalid', async () => {
      const { user } = setup();

      await complete(user);
      await submit(user);

      await waitFor(() => expect(field(/message/i)).toHaveValue(''));

      expect(field(/message/i)).toHaveAttribute('aria-invalid', 'false');
    });

    it('moves focus to the outcome, so it is not announced into nowhere', async () => {
      const { user } = setup();

      await complete(user);
      await submit(user);

      await waitFor(() =>
        expect(screen.getByText(messages.sent)).toHaveFocus(),
      );
    });

    it('explains a rate-limited submission', async () => {
      const { user } = setup({ result: { outcome: 'limited' } });

      await complete(user);
      await submit(user);

      expect(await screen.findByText(messages.limited)).toBeInTheDocument();
    });

    it('keeps what was typed when the send is refused', async () => {
      const { user } = setup({ result: { outcome: 'limited' } });

      await complete(user);
      await submit(user);

      await waitFor(() =>
        expect(screen.getByText(messages.limited)).toBeInTheDocument(),
      );

      expect(field(/message/i)).toHaveValue(filled.message);
    });

    it('marks the fields the service rejected', async () => {
      const { user } = setup({
        result: { outcome: 'invalid', fields: ['email'] },
      });

      await complete(user);
      await submit(user);

      await waitFor(() =>
        expect(field(/email/i)).toHaveAttribute('aria-invalid', 'true'),
      );
    });

    it('still explains a rejection that names no fields', async () => {
      const { user } = setup({ result: { outcome: 'invalid', fields: [] } });

      await complete(user);
      await submit(user);

      expect(await screen.findByText(messages.invalid)).toBeInTheDocument();
    });

    it('falls back to the address when the service cannot be reached', async () => {
      const { user } = setup({ result: { outcome: 'failed' } });

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
});
