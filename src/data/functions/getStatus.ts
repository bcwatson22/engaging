import { serviceOrigin } from '@/constants/common';
import { artifacts, type TQueue, type TStatus } from '@/data/types/status';

const endpoint = `${serviceOrigin}/status`;

/* The service sleeps between renders and cold-boots in about twenty seconds.
   Nobody should wait that long for a status page, and a page that renders
   without the numbers is more useful than one that hangs. */
const timeout = 4000;

/* Matches the endpoint's own cache-control, so the page and the service agree
   on how stale this is allowed to be. */
const revalidate = 60;

const isNumber = (value: unknown): boolean => typeof value === 'number';

const isRecord = (value: unknown): boolean => {
  if (typeof value !== 'object' || value === null) return false;

  const { at, result, durationMs, attempts, elapsedMs } = value as Record<
    string,
    unknown
  >;

  return (
    typeof at === 'string' &&
    typeof result === 'string' &&
    [durationMs, attempts, elapsedMs].every(isNumber)
  );
};

const isHistory = (value: unknown): boolean =>
  Array.isArray(value) && value.every(isRecord);

/* Null is valid: a check that has not run yet reports nothing rather than a
   made-up result. Undefined is valid too — see `checksIn`. */
const isCheck = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'object') return false;

  const { at, drifted, queued, stale } = value as Record<string, unknown>;

  return (
    typeof at === 'string' &&
    [drifted, queued, stale].every((flag) => typeof flag === 'boolean')
  );
};

/* Checked rather than cast. The service deploys separately from the site, so
   "the shape I expect" is an assumption about another process at another
   version — and rendering `undefined` into a page is a worse failure than
   showing that the status could not be read. */
const isStatus = (value: unknown): value is TStatus => {
  if (typeof value !== 'object' || value === null) return false;

  const {
    artifacts: records,
    integrity,
    links,
    queue,
  } = value as Partial<TStatus>;

  if (typeof records !== 'object' || records === null) return false;
  if (typeof queue !== 'object' || queue === null) return false;

  /* Absent is allowed, not merely empty. The service deploys separately from
     the site, so a version of it predating the integrity check is a real
     thing to meet — and refusing to read its response would turn a missing
     feature into "the service is not answering", which is a lie. */
  if (integrity !== undefined && typeof integrity !== 'object') return false;
  if (!isSweep(links)) return false;

  return (
    artifacts.every((name) => isHistory(records[name])) &&
    artifacts.every((name) => isCheck(integrity?.[name]))
  );
};

const linkStates = ['ok', 'blocked', 'broken'];

const isLinkResult = (value: unknown): boolean => {
  if (typeof value !== 'object' || value === null) return false;

  const { url, status, state } = value as Record<string, unknown>;

  return (
    typeof url === 'string' &&
    typeof status === 'number' &&
    typeof state === 'string' &&
    linkStates.includes(state)
  );
};

/* Absent and null both mean no sweep — the first because the service may
   predate the sweep, the second because it may not have run one yet. */
const isSweep = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'object') return false;

  const { at, checked, problems } = value as Record<string, unknown>;

  return (
    typeof at === 'string' &&
    typeof checked === 'number' &&
    Array.isArray(problems) &&
    problems.every(isLinkResult)
  );
};

/* Counts are read individually rather than demanded as a set.

   They were demanded as a set, and it cost the page: when the service moved
   from BullMQ to a Redis stream its counts changed name, every one of them
   failed `isNumber`, the whole payload was rejected as unrecognisable, and
   the page told visitors the service was not answering — while it answered
   perfectly well. The rest of the response was fine and none of it was shown.

   The same reasoning already applied to integrity and links a few lines up;
   the queue was the one place the response had to be perfect. A count this
   version does not know reads as zero, and the rest of the page survives. */
const countIn = (queue: Partial<TQueue>, key: keyof TQueue): number =>
  isNumber(queue[key]) ? (queue[key] as number) : 0;

const queueIn = ({ queue }: TStatus): TQueue => ({
  waiting: countIn(queue, 'waiting'),
  pending: countIn(queue, 'pending'),
  dead: countIn(queue, 'dead'),
});

/* A service too old to run integrity checks reports the same thing as one
   that has not run any yet: nothing found, for either artifact. */
const checksIn = ({ integrity }: TStatus): TStatus['integrity'] =>
  integrity ??
  (Object.fromEntries(
    artifacts.map((name) => [name, null]),
  ) as TStatus['integrity']);

/* Returns null rather than throwing, on any failure — asleep, unreachable, or
   answering something this page does not recognise. The page renders either
   way; see the Status component for what it says when there is nothing. */
const getStatus = async (): Promise<TStatus | null> => {
  try {
    const response = await fetch(endpoint, {
      signal: AbortSignal.timeout(timeout),
      next: { revalidate },
    });

    if (!response.ok) return null;

    const parsed: unknown = await response.json();

    return isStatus(parsed)
      ? {
          ...parsed,
          integrity: checksIn(parsed),
          links: parsed.links ?? null,
          queue: queueIn(parsed),
        }
      : null;
  } catch {
    return null;
  }
};

export { getStatus, endpoint, timeout, revalidate, isStatus };
