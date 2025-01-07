"use client";

import { useEffect } from "react";

import { Error, type ErrorProps } from "@/components/pages/Error/Error";

type Props = Pick<ErrorProps, "reset"> & {
  error: Error & { digest?: string };
};

const ErrorPage = ({ error, reset }: Props) => {
  useEffect(() => console.error(error), [error]);

  return <Error reset={reset} />;
};

export default ErrorPage;
export type { Props as ErrorPageProps };
