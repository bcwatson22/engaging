import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/* "2 hours ago" is what someone actually wants from a timestamp on a status
   page. The exact time still goes in the `datetime` attribute beside it, so
   nothing is lost — this is the reading, not the record.

   Computed on the server at render time, so it is only as fresh as the page's
   revalidate window. At a minute, that is close enough for a reading measured
   in hours. */
const formatRelative = (at: string): string => {
  const moment = dayjs(at);

  return moment.isValid() ? moment.fromNow() : 'at an unknown time';
};

export { formatRelative };
