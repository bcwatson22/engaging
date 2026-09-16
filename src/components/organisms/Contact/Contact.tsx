'use client';

import { useId } from 'react';

import { Button } from '@/components/atoms/Button/Button';
import { Icon } from '@/components/atoms/Icon/Icon';
import { Link } from '@/components/atoms/Link/Link';
import {
  emailPattern,
  honeypotField,
  maxMessage,
  maxName,
  messages,
  minMessage,
  outcomes,
  type Field,
} from '@/constants/contact';
import { useContact } from '@/hooks/useContact/useContact';

const fallback: Link = {
  id: 'contact-fallback',
  target:
    'mailto:hello@engaging.engineering?subject=Engaging%20Engineering%20Enquiry',
  text: 'hello@engaging.engineering',
  icon: 'Email',
};

const FieldError = ({ id, message }: { id: string; message?: string }) => (
  <span
    id={id}
    className="error reveal"
    data-shown={Boolean(message)}
    aria-hidden={!message || undefined}
  >
    <span>{message}</span>
  </span>
);

const Contact = () => {
  const headingId = useId();
  const statusId = useId();
  const requiredId = useId();
  const ids: Record<Field, string> = {
    name: useId(),
    email: useId(),
    message: useId(),
  };

  const {
    values,
    errors,
    outcome,
    isPending,
    formRef,
    statusRef,
    submit,
    onChange,
    onBlur,
  } = useContact();

  const describedBy = (field: Field): string | undefined =>
    errors[field] ? `${ids[field]}-error` : undefined;

  const shared = (field: Field) => ({
    name: field,
    required: true,
    value: values[field],
    onChange,
    onBlur,
    'aria-invalid': Boolean(errors[field]),
    'aria-describedby': describedBy(field),
  });

  return (
    <section aria-labelledby={headingId} className="contact-form">
      <form ref={formRef} action={submit} noValidate>
        <fieldset aria-describedby={requiredId}>
          <legend>
            <h2 id={headingId}>Get in touch</h2>
          </legend>
          <p id={requiredId} className="text-sm">
            All fields are required.
          </p>

          <div className="field">
            <label>
              <span>Name</span>
              <input
                {...shared('name')}
                type="text"
                maxLength={maxName}
                autoComplete="name"
              />
            </label>
            <FieldError id={`${ids.name}-error`} message={errors.name} />
          </div>

          <div className="field">
            <label>
              <span>Email</span>
              <input
                {...shared('email')}
                type="email"
                pattern={emailPattern}
                autoComplete="email"
              />
            </label>
            <FieldError id={`${ids.email}-error`} message={errors.email} />
          </div>

          <div className="field">
            <label>
              <span>Message</span>
              <textarea
                {...shared('message')}
                rows={6}
                minLength={minMessage}
                maxLength={maxMessage}
              />
            </label>
            <FieldError id={`${ids.message}-error`} message={errors.message} />
          </div>

          <div className="honeypot" aria-hidden="true">
            <label className="honeypot" aria-hidden="true">
              <span>Leave this empty</span>
              <input
                name={honeypotField}
                type="text"
                tabIndex={-1}
                autoComplete="off"
                defaultValue=""
              />
            </label>
          </div>
        </fieldset>

        <Button icon="Send" type="submit" disabled={isPending}>
          {isPending ? 'Sending…' : 'Send'}
        </Button>
      </form>

      <output
        ref={statusRef}
        id={statusId}
        tabIndex={-1}
        className="status reveal"
        data-shown={outcome !== 'idle'}
      >
        <span
          data-state={outcome === 'idle' ? undefined : outcomes[outcome].state}
        >
          {outcome !== 'idle' && (
            <>
              <Icon icon={outcomes[outcome].icon} className="mark" />
              <span>{messages[outcome]}</span>
            </>
          )}
        </span>
      </output>

      <p className="fallback">
        Or email me directly at: <Link link={fallback} className="block" />
      </p>
    </section>
  );
};

export { Contact, fallback };
