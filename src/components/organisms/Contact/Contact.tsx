'use client';

import { useId } from 'react';

import { Button } from '@/components/atoms/Button/Button';
import { Icon } from '@/components/atoms/Icon/Icon';
import { Link, type TLink } from '@/components/atoms/Link/Link';
import {
  emailPattern,
  honeypotField,
  maxMessage,
  maxName,
  messages,
  minMessage,
  outcomes,
  type TField,
} from '@/constants/contact';
import { useContact } from '@/hooks/useContact/useContact';

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

/* Always rendered, even with nothing to say, so an arriving error can
   transition its row open instead of appearing at full height. Empty when
   there is no error, so nothing stale is left in the accessibility tree — and
   aria-hidden while it is collapsed, since a screen reader should not meet an
   error that is not being shown.

   Not referenced by aria-describedby unless it has content: see `describedBy`
   below. */
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
  const ids: Record<TField, string> = {
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

  /* Points at the field's own error when it has one. Not at the status
     region: that carries the overall outcome, and pointing every invalid
     field at it would have a screen reader read the same sentence repeatedly. */
  const describedBy = (field: TField): string | undefined =>
    errors[field] ? `${ids[field]}-error` : undefined;

  const shared = (field: TField) => ({
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
        {/* The heading lives inside the legend so the group is named and the
            page still has a heading to navigate by — a legend does not appear
            in a heading list, and an h2 does not name a group. Both, once.

            The button sits outside the fieldset: it is an action on the
            group, not a field in it. */}
        <fieldset>
          <legend>
            <h2 id={headingId}>Get in touch</h2>
          </legend>

          {/* The error sits beside the label rather than inside it. A label's
            text content becomes its control's accessible name, so an error
            nested in there would be appended to the name — a screen reader
            would announce "Email, please enter a valid email address…" as
            what the field is called, then read it again as its description. */}
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

          {/* Hidden from everyone who should not see it: from sight, from the
            accessibility tree, and from the tab order. Left uncontrolled and
            read from the submitted FormData, which is the most faithful
            record of what a bot actually filled in. */}
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

      {/* `output` rather than a div with role="status": it carries that role
          implicitly, along with an aria-live of polite.

          Always in the DOM so its updates are announced — a live region added
          to the page at the same moment as its content is unreliable.

          Collapsed rather than hidden when there is no outcome. It keeps no
          text while collapsed, so there is nothing stale to read, and unlike
          the field errors it is never aria-hidden: hiding a live region from
          the accessibility tree stops it announcing at all. */}
      <output
        ref={statusRef}
        id={statusId}
        tabIndex={-1}
        className="status reveal"
        data-shown={outcome !== 'idle'}
      >
        {/* The icon lives inside the collapsing row, so it arrives with the
            sentence rather than sitting there while the row is shut. */}
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
