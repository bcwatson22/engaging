import { Icon, type TIcon } from '@/components/atoms/Icon/Icon';
import type { TArtifact, TQueue, TRecord, TStatus } from '@/data/types/status';
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

type Props = {
  status: TStatus | null;
};

const Artifact = ({
  artifact,
  record,
}: {
  artifact: TArtifact;
  record: TRecord | null;
}) => {
  const { name, icon } = labels[artifact];

  return (
    <li className="artifact">
      <Icon icon={icon} className="vector" />
      <h3>{name}</h3>
      {record ? (
        <>
          {/* The exact moment stays in `datetime`, so the reading above it can
              be the loose one a person actually wants. */}
          <time dateTime={record.at}>{formatRelative(record.at)}</time>
          <p className="result">{record.result}</p>
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
          deployed. This is what it last produced.
        </p>

        <ul className="artifacts">
          {(Object.keys(labels) as TArtifact[]).map((artifact) => (
            <Artifact
              key={artifact}
              artifact={artifact}
              record={status.artifacts[artifact]}
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

export { Status, labels, counts };
export type { Props as StatusProps };
