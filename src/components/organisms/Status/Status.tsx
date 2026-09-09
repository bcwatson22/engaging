import { Icon, type TIcon } from '@/components/atoms/Icon/Icon';
import type {
  TArtifact,
  TCheck,
  TLinkState,
  TQueue,
  TRecord,
  TStatus,
  TSweep,
} from '@/data/types/status';
import { formatDuration } from '@/utils/formatDuration';
import { formatRelative } from '@/utils/formatRelative';

/* What each artifact is called and drawn as here, rather than in the service.
   The service reports keys; a page decides how to say them. */
const labels: Record<TArtifact, { name: string; icon: TIcon }> = {
  'cv-pdf': { name: 'CV document', icon: 'Document' },
  'startup-images': { name: 'App splash screens', icon: 'Website' },
};

/* Ordered by how much they mean rather than by the queue's own vocabulary:
   anything given up on is the thing to notice, and waiting comes last.

   Three rather than four. The queue is a Redis stream now, and a stream has
   no 'delayed' — the worker's retry ladder runs in its own process, so a job
   waiting to be retried is one the worker is still holding, which is what
   'Rendering' already says. */
const counts: { key: keyof TQueue; name: string }[] = [
  { key: 'dead', name: 'Failed' },
  { key: 'pending', name: 'Rendering' },
  { key: 'waiting', name: 'Waiting' },
];

/* Twelve columns is about a year of renders and about as many as stay
   readable at this width. */
const shown = 12;

/* Status, not a series — so these carry an icon and a sentence, never colour
   alone, and they use the reserved status hues rather than the chart's. */
type TState = 'unchecked' | 'current' | 'queued' | 'stale';

const states: Record<TState, { icon: TIcon; says: string }> = {
  unchecked: { icon: 'Retry', says: 'Not checked yet' },
  current: { icon: 'CheckCircle', says: 'Matches the live page' },
  queued: { icon: 'Retry', says: 'Page changed — a re-render is queued' },
  stale: { icon: 'Warning', says: 'Still out of date after a re-render' },
};

const stateOf = (check: TCheck | null): TState => {
  if (check === null) return 'unchecked';
  if (check.stale) return 'stale';
  if (check.drifted) return 'queued';

  return 'current';
};

/* What the weekly check last found. Its boring answer is the common one, so
   it reads as a quiet line rather than a banner — only `stale` is worth
   catching an eye, because it is the one thing re-rendering will not fix. */
const Integrity = ({ check }: { check: TCheck | null }) => {
  const state = stateOf(check);
  const { icon, says } = states[state];

  return (
    <p className="integrity" data-state={state}>
      <Icon icon={icon} className="mark" />
      <span className="says">{says}</span>
      {check && (
        <time dateTime={check.at}>checked {formatRelative(check.at)}</time>
      )}
    </p>
  );
};

type Props = {
  status: TStatus | null;
};

/* Elapsed spans every attempt; duration is only the successful one. What is
   left is the service refusing to render while the site still served its
   previous content — clamped, because two clocks are involved. */
const waitOf = ({ elapsedMs, durationMs }: TRecord): number =>
  Math.max(elapsedMs - durationMs, 0);

/* Where the render's own time sits as a share of the whole. Two segments, so
   one width is enough — the other is the remainder. */
const renderShare = (record: TRecord): number => {
  const total = waitOf(record) + record.durationMs;

  return total === 0 ? 100 : (record.durationMs / total) * 100;
};

/* One render, split into the wait and the work. Both segments are labelled,
   so identity never rests on colour — which the palette's contrast check
   obliges rather than merely suggests. */
const Ladder = ({ record }: { record: TRecord }) => {
  const wait = waitOf(record);
  const share = renderShare(record);

  return (
    <div className="ladder">
      {/* Decorative, and hidden rather than labelled: every number it draws
          is stated in the list beneath it, so describing the bar as well
          would have a screen reader read the same figures twice. */}
      <div className="track" aria-hidden="true">
        <span className="wait" style={{ width: `${100 - share}%` }} />
        <span className="render" style={{ width: `${share}%` }} />
      </div>

      <dl className="legend">
        <div>
          <dt>
            <span className="key wait" /> Waited
          </dt>
          <dd>
            {formatDuration(wait)} over {record.attempts}{' '}
            {record.attempts === 1 ? 'attempt' : 'attempts'}
          </dd>
        </div>
        <div>
          <dt>
            <span className="key render" /> Rendered
          </dt>
          <dd>{formatDuration(record.durationMs)}</dd>
        </div>
      </dl>
    </div>
  );
};

/* A single series, so no legend — the heading names it. Heights are relative
   to the slowest render shown, which is what makes a short bar mean anything.

   The table beside it is not a fallback; it is the same data in the form a
   screen reader, a print-out or anyone who prefers numbers can use. */
const Durations = ({ history }: { history: TRecord[] }) => {
  const recent = history.slice(0, shown).reverse();
  const slowest = Math.max(...recent.map(({ durationMs }) => durationMs));

  return (
    <figure className="durations">
      <figcaption>Render time, oldest to newest</figcaption>

      <div className="columns" aria-hidden="true">
        {recent.map((record) => (
          <span
            key={record.at}
            className="column"
            style={{
              height: `${Math.max((record.durationMs / slowest) * 100, 4)}%`,
            }}
          />
        ))}
      </div>

      <table className="sr-only">
        <caption>Render time, oldest to newest</caption>
        <thead>
          <tr>
            <th scope="col">Finished</th>
            <th scope="col">Render time</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((record) => (
            <tr key={record.at}>
              <td>{formatRelative(record.at)}</td>
              <td>{formatDuration(record.durationMs)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
};

/* A host refusing a robot is not a link that is gone. LinkedIn answers 999 to
   anything automated, so calling that broken would make the whole list read as
   noise and get ignored — including the time something has genuinely died. */
const linkStates: Record<
  Exclude<TLinkState, 'ok'>,
  { icon: TIcon; says: string }
> = {
  broken: { icon: 'Warning', says: 'did not answer' },
  blocked: { icon: 'Cross', says: 'refused an automated check' },
};

const Links = ({ sweep }: { sweep: TSweep | null }) => {
  if (sweep === null) {
    return (
      <p className="sweep-summary" data-state="muted">
        Outbound links have not been checked yet
      </p>
    );
  }

  const broken = sweep.problems.filter(({ state }) => state === 'broken');

  return (
    <>
      {/* The count is the reassuring part and the reason nothing else needs
          listing: every link not named below answered. */}
      <p
        className="sweep-summary"
        data-state={broken.length > 0 ? 'bad' : 'ok'}
      >
        <Icon icon={broken.length > 0 ? 'Warning' : 'Check'} className="mark" />
        <span>
          {sweep.checked} outbound {sweep.checked === 1 ? 'link' : 'links'}{' '}
          checked
          {broken.length > 0
            ? `, ${broken.length} not answering`
            : ', all answering'}
        </span>
        <time dateTime={sweep.at}>{formatRelative(sweep.at)}</time>
      </p>

      {sweep.problems.length > 0 && (
        <ul className="sweep-problems">
          {sweep.problems.map(({ url, status, state }) => {
            const { icon, says } =
              linkStates[state as Exclude<TLinkState, 'ok'>];

            return (
              <li key={url} data-state={state}>
                <Icon icon={icon} className="mark" />
                <span className="url">{url}</span>
                <span className="says">
                  {says}
                  {status > 0 && ` (${status})`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
};

const Artifact = ({
  artifact,
  history,
  check,
}: {
  artifact: TArtifact;
  history: TRecord[];
  check: TCheck | null;
}) => {
  const { name, icon } = labels[artifact];
  const [latest] = history;

  return (
    <li className="artifact">
      <h3>
        <Icon icon={icon} className="mark" />
        {name}
      </h3>

      {latest ? (
        <>
          {/* The reading someone came for, at the size that says so. The
              exact moment stays machine-readable beside it. */}
          <p className="freshness">
            <strong>{formatRelative(latest.at)}</strong>
            <time dateTime={latest.at}>
              {new Date(latest.at).toUTCString()}
            </time>
          </p>

          <Ladder record={latest} />
          {history.length > 1 && <Durations history={history} />}

          <Integrity check={check} />
          <p className="result">{latest.result}</p>
        </>
      ) : (
        <p className="result">Not rendered since this was last deployed</p>
      )}
    </li>
  );
};

const Status = ({ status }: Props) => (
  <section aria-labelledby="status-heading" className="status-panel">
    {/* Heading and intro grouped, so the gap between them is theirs rather
        than the panel's — the motes page reads the same way. */}
    <header>
      <h2 id="status-heading">Service status</h2>
      <p className="intro">
        {status
          ? 'The CV document and the app splash screens are rendered by a separate service when the content changes, rather than when the site is deployed. Each render waits for the site to catch up before it starts — that wait is the first half of every bar below.'
          : /* Not an error. The service sleeps between renders, so being
               unreachable is its ordinary resting state rather than a fault,
               and saying so is more honest than a red banner. */
            'The render service is not answering at the moment. It sleeps between renders, so this is usually nothing — the CV and splash screens are served from storage and are unaffected either way.'}
      </p>
    </header>

    {status && (
      <>
        <ul className="artifacts">
          {(Object.keys(labels) as TArtifact[]).map((artifact) => (
            <Artifact
              key={artifact}
              artifact={artifact}
              history={status.artifacts[artifact]}
              check={status.integrity[artifact]}
            />
          ))}
        </ul>

        <h3 className="queue-heading">Outbound links</h3>
        <Links sweep={status.links} />

        <h3 className="queue-heading">Render queue</h3>
        <ul className="queue">
          {counts.map(({ key, name }) => (
            <li key={key} data-state={key} data-busy={status.queue[key] > 0}>
              <span className="count">{status.queue[key]}</span>
              <span className="name">{name}</span>
            </li>
          ))}
        </ul>
      </>
    )}
  </section>
);

export {
  Status,
  labels,
  counts,
  shown,
  waitOf,
  renderShare,
  states,
  stateOf,
  linkStates,
};
export type { Props as StatusProps };
