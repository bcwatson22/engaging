'use client';

import { useEffect } from 'react';

import { Error, type ErrorProps } from '@/components/pages/Error/Error';

type Props = Pick<ErrorProps, 'reset'> & {
  error: Error & { digest?: string };
};

const title = 'Something went wrong | Engaging Engineering';

const ErrorPage = ({ error, reset }: Props) => {
  useEffect(() => console.error(error), [error]);

  return (
    <>
      <title>{title}</title>
      <Error reset={reset} />
    </>
  );
};

export default ErrorPage;
export { title };
export type { Props as ErrorPageProps };
