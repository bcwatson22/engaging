import { Link } from '@/components/atoms/Link/Link';
import { Error } from '@/components/pages/Error/Error';

const title = 'Page not found | Engaging Engineering';

const NotFound = () => (
  <Error heading="Are you lost?">
    <title>{title}</title>
    <p className="mb-4">
      We couldn&apos;t find what you were looking for. Maybe it&apos;s moved
      from behind the Pringles, or it might never have existed at all.
    </p>
    <Link link={{ target: '/', text: 'Home', icon: 'Home' }} />
  </Error>
);

export default NotFound;
export { title };
