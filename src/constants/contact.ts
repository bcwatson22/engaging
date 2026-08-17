/* Shared by the hook that validates and the component that renders, so the
   constraints in the markup and the messages shown when they fail cannot
   drift apart. Kept in step with engaging-service's own zod schema —
   divergence shows up as the server rejecting something the form accepted,
   which reads as a bug even though nothing is broken. */

/* Named for what an autofill heuristic expects to see, not for what it does.
   A bot fills every field it finds; a person never sees this one. */
const honeypotField = 'website';

const fields = ['name', 'email', 'message'] as const;

type TField = (typeof fields)[number];
type TValues = Record<TField, string>;
type TErrors = Partial<Record<TField, string>>;

const empty: TValues = { name: '', email: '', message: '' };

const minMessage = 10;
const maxMessage = 5000;
const maxName = 100;

/* `type="email"` alone is looser than the service is: browsers accept
   `tom@example`, with no dot and no top-level domain, while the service's zod
   schema rejects it. Without this the form would submit an address and get a
   400 back for a field it had just called valid.

   Requires an @, then a dot, then at least two more characters. Deliberately
   not an attempt at RFC 5322 — the only address that truly validates is one
   that receives mail, and the server checks again regardless. */
const emailPattern = '[^@\\s]+@[^@\\s]+\\.[^@\\s]{2,}';

/* The browser's message for a pattern mismatch is "Please match the requested
   format", which tells nobody anything. Every other constraint gets a decent
   native message, so this is the only one written by hand. */
const patternMessage =
  'Please enter a valid email address, for example tom@thumb.com.';

/* What the server said about a field, when it disagrees with the browser.
   Deliberately vague: the response carries field names, not reasons. */
const rejectedMessage = 'This was not accepted.';

/* `invalid` is only ever the server disagreeing with the browser —
   client-side failures never reach the network. */
type TOutcome = 'idle' | 'sent' | 'invalid' | 'limited' | 'failed';

const messages: Record<Exclude<TOutcome, 'idle'>, string> = {
  sent: 'Thanks for your message. I will reply as soon as I can.',
  invalid: 'Hmm, some of the details might need another gander.',
  limited:
    'That is a shedload of messages in precious little time. Please try again a little later, or email me directly.',
  failed:
    'Oops, something went wrong. Please try again or email me directly instead.',
};

export {
  honeypotField,
  fields,
  empty,
  minMessage,
  maxMessage,
  maxName,
  emailPattern,
  patternMessage,
  rejectedMessage,
  messages,
};
export type { TField, TValues, TErrors, TOutcome };
