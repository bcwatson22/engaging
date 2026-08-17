import { Icon, type TIcon } from '@/components/atoms/Icon/Icon';
import type { TArtifact, TQueue, TRecord, TStatus } from '@/data/types/status';
import { formatDuration } from '@/utils/formatDuration';
import { formatRelative } from '@/utils/formatRelative';

/* What each artifact is called and drawn as here, rather than in the service.
   The service reports keys; a page decides how to say them. */
const labels: Record<TArtifact, { name: string; icon: TIcon }> = {
  'cv-pdf': { name: 'CV document', icon: 'Document' },
  'startup-images': { name: 'App splash screens', icon: 'Website' },
};

/* Ordered by how much they mean rather than by the queue's own vocabulary:
   anything failed is the thing to notice, and waiting comes before the
   bookkeeping states. */
const counts: { key: keyof TQueue; name: string }[] = [
  { key: 'failed', name: 'Failed' },
  { key: 'active', name: 'Rendering' },
  { key: 'waiting', name: 'Waiting' },
  { key: 'delayed', name: 'Retrying' },
];

/* Twelve columns is about a year of renders and about as many as stay
   readable at this width. */
const shown = 12;

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

const Artifact = ({
  artifact,
  history,
}: {
  artifact: TArtifact;
  history: TRecord[];
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
    <h2 id="status-heading">Service status</h2>

    {status ? (
      <>
        <p className="intro">
          The CV document and the app splash screens are rendered by a separate
          service when the content changes, rather than when the site is
          deployed. Each render waits for the site to catch up before it starts
          — that wait is the first half of every bar below.
        </p>

        <ul className="artifacts">
          {(Object.keys(labels) as TArtifact[]).map((artifact) => (
            <Artifact
              key={artifact}
              artifact={artifact}
              history={status.artifacts[artifact]}
            />
          ))}
        </ul>

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
    ) : (
      /* Not an error page. The service sleeps between renders, so being
         unreachable is its ordinary resting state rather than a fault, and
         saying so is more honest than a red banner. */
      <p className="intro">
        The render service is not answering at the moment. It sleeps between
        renders, so this is usually nothing — the CV and splash screens are
        served from storage and are unaffected either way.
      </p>
    )}
  </section>
);

export { Status, labels, counts, shown, waitOf, renderShare };
export type { Props as StatusProps };
