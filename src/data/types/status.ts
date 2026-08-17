/* Mirrors what engaging-service's GET /status returns. Declared here rather
   than shared from the service, because the two deploy independently and a
   type that cannot drift is a type that lies — the parse in getStatus is what
   actually holds the contract. */

const artifacts = ['cv-pdf', 'startup-images'] as const;

type TArtifact = (typeof artifacts)[number];

/* `result` is a string rather than a URL: the PDF has one public URL, the
   startup images have twenty-two and no single one between them, so the
   service reports whatever the render produced.

   `durationMs` is the render itself; `elapsedMs` is enqueue to finish, so the
   difference between them is how long the site took to catch up after a
   publish — the race the service's content check retries through. */
type TRecord = {
  at: string;
  result: string;
  durationMs: number;
  attempts: number;
  elapsedMs: number;
};

/* What the service's weekly integrity check last found for an artifact.

   `drifted` — the live page no longer matches what was last rendered from it.
   `queued`  — that check enqueued a render to put it right.
   `stale`   — it drifted, a render was already queued by an earlier check, and
               it is still drifting. Something is wrong that re-rendering will
               not fix, which is the one state worth looking at. */
type TCheck = {
  at: string;
  drifted: boolean;
  queued: boolean;
  stale: boolean;
};

type TQueue = {
  waiting: number;
  active: number;
  delayed: number;
  failed: number;
};

/* Newest first. The head is "when was this last rendered"; the tail is the
   history the page draws. */
type TStatus = {
  artifacts: Record<TArtifact, TRecord[]>;
  /* Null where a check has not run yet — the schedule is weekly, so that is
     the ordinary state for the first few days after a deploy. */
  integrity: Record<TArtifact, TCheck | null>;
  queue: TQueue;
};

export { artifacts };
export type { TStatus, TRecord, TCheck, TQueue, TArtifact };
