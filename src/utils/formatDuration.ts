const second = 1000;
const minute = 60 * second;

/* Renders take tens of seconds and the waits before them take minutes, so
   this only ever needs those two units. Rounded rather than precise: nobody
   reading a status page cares about the milliseconds, and "14s" is easier to
   compare at a glance than "13,812ms". */
const formatDuration = (ms: number): string => {
  if (!Number.isFinite(ms) || ms < 0) return '—';

  if (ms < minute) return `${Math.round(ms / second)}s`;

  const minutes = Math.floor(ms / minute);
  const seconds = Math.round((ms % minute) / second);

  return seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`;
};

export { formatDuration, second, minute };
