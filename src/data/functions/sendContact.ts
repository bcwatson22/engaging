import { honeypotField, type Values } from '@/constants/contact';

const endpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;

const tooManyRequests = 429;

type Payload = Values & {
  [honeypotField]: string;
  renderedAt: number;
};

/* What the caller can act on, rather than a Response it would have to
   interpret. `invalid` carries the field names the service named, so the form
   can mark them; nothing else needs detail. */
type Result =
  | { outcome: 'sent' }
  | { outcome: 'limited' }
  | { outcome: 'invalid'; fields: string[] }
  | { outcome: 'failed' };

type ErrorBody = { fields?: string[] };

/* Kept out of the component and the hook so the network is one thing that can
   be swapped in a test, and so the only place that knows this service speaks
   JSON over HTTP is here. */
const sendContact = async (payload: Payload): Promise<Result> => {
  try {
    const response = await fetch(endpoint!, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) return { outcome: 'sent' };

    if (response.status === tooManyRequests) return { outcome: 'limited' };

    const { fields = [] } = (await response.json()) as ErrorBody;

    return { outcome: 'invalid', fields };
  } catch {
    /* A network failure, an unreachable service, or CORS. None are
       distinguishable from here, and none change what the visitor should do. */
    return { outcome: 'failed' };
  }
};

export { sendContact, endpoint, tooManyRequests };
export type { Payload, Result };
