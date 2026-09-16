/* A view transition cannot run while the document is hidden, and when React
   starts one anyway — a navigation, a Suspense reveal, a hot reload in a
   background tab — the browser skips it and rejects its promises. React does
   not catch them, so each shows up as "Uncaught InvalidStateError: Transition
   was aborted because of invalid state", and in development Next surfaces it in
   the error overlay and forwards it to the terminal. Nothing is broken: the
   update still happens, without the animation.

   This listens for exactly those errors and stops them there. It has to be
   registered before Next's own listeners, which ignore preventDefault, so it
   also stops propagation; instrumentation-client.ts runs before the app, which
   is what puts it first. Anything else is left alone. */
const skipped: Record<string, string> = {
  InvalidStateError: 'Transition was aborted',
  AbortError: 'Transition was skipped',
};

const isSkippedTransition = (value: unknown): boolean =>
  value instanceof DOMException &&
  value.name in skipped &&
  value.message.startsWith(skipped[value.name]);

const silenceSkippedTransitions = (target: Window = window): (() => void) => {
  const silence = (event: Event, value: unknown): void => {
    if (!isSkippedTransition(value)) return;

    event.preventDefault();
    event.stopImmediatePropagation();
  };

  const onRejection = (event: PromiseRejectionEvent): void =>
    silence(event, event.reason);

  const onError = (event: ErrorEvent): void => silence(event, event.error);

  target.addEventListener('unhandledrejection', onRejection);
  target.addEventListener('error', onError);

  return () => {
    target.removeEventListener('unhandledrejection', onRejection);
    target.removeEventListener('error', onError);
  };
};

export { isSkippedTransition, silenceSkippedTransitions };
