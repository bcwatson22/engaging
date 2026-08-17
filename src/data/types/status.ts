/* Mirrors what engaging-service's GET /status returns. Declared here rather
   than shared from the service, because the two deploy independently and a
   type that cannot drift is a type that lies — the parse in getStatus is what
   actually holds the contract. */

const artifacts = ['cv-pdf', 'startup-images'] as const;

type TArtifact = (typeof artifacts)[number];

/* `result` is a string rather than a URL: the PDF has one public URL, the
   startup images have twenty-two and no single one between them, so the
   service reports whatever the render produced. */
type TRecord = {
  at: string;
  result: string;
};

type TQueue = {
  waiting: number;
  active: number;
  delayed: number;
  failed: number;
};

type TStatus = {
  artifacts: Record<TArtifact, TRecord | null>;
  queue: TQueue;
};

export { artifacts };
export type { TStatus, TRecord, TQueue, TArtifact };
