'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { Link, type TLink } from '@/components/atoms/Link/Link';

/* Mirrors the service's honeypot field name. Named for what an autofill
   heuristic expects to see — a bot fills every field it finds, a person never
   sees this one. */
const honeypotField = 'website';

const endpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;

/* Every failure a visitor can act on. `limited` and `failed` differ only in
   what they say, but they are worth distinguishing because one is temporary
   and self-inflicted and the other is not. */
type TStatus = 'idle' | 'sending' | 'sent' | 'invalid' | 'limited' | 'failed';

type TResponse = { fields?: string[] };

const messages: Record<Exclude<TStatus, 'idle' | 'sending'>, string> = {
  sent: 'Thanks — that has reached me. I will reply as soon as I can.',
  invalid: 'Some details need another look.',
  limited:
    'That is a few messages in a short time. Please try again a little later, or email me directly.',
  failed:
    'Something went wrong sending that. Please email me directly instead.',
};

/* The address the form falls back to. Shown always rather than only on
   failure: it is the capability the site had before this form existed, and it
   needs no JavaScript and no server. */
const fallback: TLink = {
  id: 'contact-fallback',
  target:
    'mailto:hello@engaging.engineering?subject=Engaging%20Engineering%20Enquiry',
  text: 'hello@engaging.engineering',
  icon: 'Email',
};

const ContactForm = () => {
  const headingId = useId();
  const statusId = useId();
  const nameId = useId();
  const emailId = useId();
  const messageId = useId();

  const [status, setStatus] = useState<TStatus>('idle');
  const [invalidFields, setInvalidFields] = useState<string[]>([]);

  /* Captured after mount rather than during render: the server and the client
     would produce different values and hydration would complain. It is also
     the honest number — the form became fillable when it reached the browser.

     A ref rather than state, because nothing renders from it, and because it
     is written before any submit is possible: effects run on mount, and a
     submit needs a person to type first. So it needs no not-yet-set case. */
  const renderedAt = useRef(0);

  const statusRef = useRef<HTMLOutputElement>(null);

  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  /* Focus moves to the outcome rather than to the first bad field, so a screen
     reader hears what happened before being dropped into an input. aria-live
     alone would announce it but leave focus stranded at the submit button. */
  useEffect(() => {
    if (status !== 'idle' && status !== 'sending') statusRef.current?.focus();
  }, [status]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setStatus('sending');
    setInvalidFields([]);

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch(endpoint!, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          message: form.get('message'),
          [honeypotField]: form.get(honeypotField),
          renderedAt: renderedAt.current,
        }),
      });

      if (response.ok) {
        setStatus('sent');

        return;
      }

      if (response.status === 429) {
        setStatus('limited');

        return;
      }

      const { fields = [] } = (await response.json()) as TResponse;

      setInvalidFields(fields);
      setStatus('invalid');
    } catch {
      /* Network failure, the service being unreachable, or CORS. None of them
         are distinguishable here and none change the advice. */
      setStatus('failed');
    }
  };

  const describedBy = (field: string): string | undefined =>
    invalidFields.includes(field) ? statusId : undefined;

  const isInvalid = (field: string): boolean => invalidFields.includes(field);

  return (
    <section aria-labelledby={headingId} className="contact-form">
      <h2 id={headingId}>Get in touch</h2>

      {/* Not disabled while sending: a disabled fieldset moves focus to the
          document and a screen reader loses its place mid-submission. */}
      <form onSubmit={onSubmit} noValidate>
        <p>
          <label htmlFor={nameId}>Name</label>
          <input
            id={nameId}
            name="name"
            type="text"
            required
            autoComplete="name"
            aria-invalid={isInvalid('name')}
            aria-describedby={describedBy('name')}
          />
        </p>

        <p>
          <label htmlFor={emailId}>Email</label>
          <input
            id={emailId}
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={isInvalid('email')}
            aria-describedby={describedBy('email')}
          />
        </p>

        <p>
          <label htmlFor={messageId}>Message</label>
          <textarea
            id={messageId}
            name="message"
            required
            rows={6}
            aria-invalid={isInvalid('message')}
            aria-describedby={describedBy('message')}
          />
        </p>

        {/* Hidden from everyone who should not see it: from sight, from the
            accessibility tree, and from the tab order. Anything in it is a bot
            that filled every field it found. */}
        <p className="honeypot" aria-hidden="true">
          <label htmlFor={honeypotField}>Leave this empty</label>
          <input
            id={honeypotField}
            name={honeypotField}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </p>

        <button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send'}
        </button>
      </form>

      {/* `output` rather than a div with role="status": it carries that role
          implicitly, along with an aria-live of polite.

          Always in the DOM so its updates are announced — a live region added
          to the page at the same moment as its content is unreliable. tabIndex
          -1 makes it focusable programmatically without putting it in the tab
          order. */}
      <output ref={statusRef} id={statusId} tabIndex={-1} className="status">
        {status !== 'idle' && status !== 'sending' && messages[status]}
      </output>

      <p className="fallback">
        Or email me directly at <Link link={fallback} />.
      </p>
    </section>
  );
};

export { ContactForm, honeypotField, messages, fallback };
export type { TStatus };
