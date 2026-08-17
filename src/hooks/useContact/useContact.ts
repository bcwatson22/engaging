'use client';

import {
  type ChangeEvent,
  type FocusEvent,
  type RefObject,
  useActionState,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  empty,
  fields,
  honeypotField,
  patternMessage,
  rejectedMessage,
  type TErrors,
  type TField,
  type TOutcome,
  type TValues,
} from '@/constants/contact';
import { sendContact } from '@/data/functions/sendContact';

type TControl = HTMLInputElement | HTMLTextAreaElement;

type Return = {
  values: TValues;
  errors: TErrors;
  outcome: TOutcome;
  isPending: boolean;
  formRef: RefObject<HTMLFormElement | null>;
  statusRef: RefObject<HTMLOutputElement | null>;
  submit: (payload: FormData) => void;
  onChange: (event: ChangeEvent<TControl>) => void;
  onBlur: (event: FocusEvent<TControl>) => void;
};

/* The browser's own messages, rather than strings written here: already
   translated, already matching what the constraints actually say, and still
   correct if one changes. The exception is a pattern mismatch, whose native
   message is "Please match the requested format". */
const errorFor = ({
  validity: { valid, patternMismatch },
  validationMessage,
}: TControl): string => {
  if (valid) return '';

  return patternMismatch ? patternMessage : validationMessage;
};

const useContact = (): Return => {
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLOutputElement>(null);

  /* Controlled, so React 19's automatic form reset after an action cannot
     discard what someone typed when the send fails. Losing a message to a
     rate limit would be a worse bug than the rate limit. */
  const [values, setValues] = useState<TValues>(empty);
  const [errors, setErrors] = useState<TErrors>({});

  /* Which fields have been left at least once. A field is not judged until
     someone has finished with it — being told your email is invalid while
     still typing the first character is the thing everyone hates about form
     validation. After that first blur it revalidates on every keystroke, so a
     correction clears as soon as it is right. */
  const [touched, setTouched] = useState<Partial<Record<TField, boolean>>>({});

  /* Counts rejected submits. Focus cannot be moved from inside the action —
     React commits the resulting render afterwards and the call is lost — so
     the action bumps this and an effect moves focus once the fields have
     actually been marked. */
  const [rejections, setRejections] = useState<number>(0);

  /* Captured after mount rather than during render: the server and the client
     would produce different values and hydration would complain. A ref, since
     nothing renders from it and it is written before a submit is possible. */
  const renderedAt = useRef<number>(0);

  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  const controlFor = (form: HTMLFormElement, field: TField): TControl =>
    form.elements.namedItem(field) as TControl;

  const send = async (
    _previous: TOutcome,
    data: FormData,
  ): Promise<TOutcome> => {
    const form = formRef.current;

    /* Checked here as well as on blur, because a field never visited was
       never blurred. checkValidity works despite noValidate — that attribute
       only suppresses the browser's own error bubbles, which would otherwise
       compete with the messages rendered beneath each field. */
    if (form && !form.checkValidity()) {
      setErrors(
        Object.fromEntries(
          fields.map((field) => [field, errorFor(controlFor(form, field))]),
        ),
      );
      /* Submitting counts as having finished with every field, so from here
         corrections clear as they are typed rather than on the next blur. */
      setTouched(Object.fromEntries(fields.map((field) => [field, true])));
      setRejections((count) => count + 1);

      return 'idle';
    }

    const result = await sendContact({
      ...values,
      /* Asserted rather than defaulted: the honeypot is always rendered
         inside this form, so FormData always carries it. A missing one would
         mean a post that never rendered the form, which cannot reach here. */
      [honeypotField]: data.get(honeypotField) as string,
      renderedAt: renderedAt.current,
    });

    if (result.outcome === 'sent') {
      setValues(empty);
      setErrors({});
      /* Emptied fields are invalid again, so the form must forget they were
         ever touched or it would immediately mark all three. */
      setTouched({});
    }

    if (result.outcome === 'invalid')
      setErrors(
        Object.fromEntries(
          result.fields.map((field) => [field, rejectedMessage]),
        ),
      );

    return result.outcome;
  };

  const [outcome, submit, isPending] = useActionState<TOutcome, FormData>(
    send,
    'idle',
  );

  /* Focus moves to the outcome rather than being left on the button, so a
     screen reader hears the result. Not for `idle`, which is what a failed
     client-side check returns — focus has already gone to the bad field. */
  useEffect(() => {
    if (outcome !== 'idle') statusRef.current?.focus();
  }, [outcome]);

  /* Not on the first render — 0 rejections means nobody has submitted, and
     stealing focus into a field on page load would be hostile.

     Walks the declared field order rather than querying `:invalid`. That
     selector is the obvious way to write this and is not dependable: jsdom
     matched the email input while skipping an equally invalid text input
     above it. Reading `validity` is exact, and it ties focus order to the
     order the fields are declared in. */
  useEffect(() => {
    if (rejections === 0) return;

    /* Asserted rather than guarded: a rejection can only be counted from
       inside the action, which reached the form to validate it. */
    const form = formRef.current!;

    fields
      .map((field) => controlFor(form, field))
      .find((control) => !control.validity.valid)
      ?.focus();
  }, [rejections]);

  const onBlur = ({ target }: FocusEvent<TControl>) => {
    setTouched((previous) => ({ ...previous, [target.name]: true }));
    setErrors((previous) => ({ ...previous, [target.name]: errorFor(target) }));
  };

  const onChange = ({ target }: ChangeEvent<TControl>) => {
    setValues((previous) => ({ ...previous, [target.name]: target.value }));

    /* Only once touched. `target.validity` already reflects the keystroke
       being handled, so this needs no separate read of the new value. */
    if (touched[target.name as TField])
      setErrors((previous) => ({
        ...previous,
        [target.name]: errorFor(target),
      }));
  };

  return {
    values,
    errors,
    outcome,
    isPending,
    formRef,
    statusRef,
    submit,
    onChange,
    onBlur,
  };
};

export { useContact, errorFor };
export type { Return, TControl };
