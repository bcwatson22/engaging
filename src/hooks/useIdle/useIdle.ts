import { useEffect, useState } from 'react';

/* True once the page has loaded and the browser has had an idle moment. For
   work that should not compete with the first paint — the nav's prefetching
   in particular, which Lighthouse's simulated slow 4G would otherwise charge to
   Largest Contentful Paint. The timeout is the backstop for a browser that never
   goes idle; the setTimeout branch is for Safari before 18.4, which has no
   requestIdleCallback. */
const idleTimeout = 3000;
const fallbackDelay = 1500;

const useIdle = (): boolean => {
  const [isIdle, setIsIdle] = useState<boolean>(false);

  useEffect(() => {
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;

    const settle = (): void => setIsIdle(true);

    const schedule = (): void => {
      if (typeof window.requestIdleCallback === 'function') {
        idleHandle = window.requestIdleCallback(settle, {
          timeout: idleTimeout,
        });

        return;
      }

      timeoutHandle = window.setTimeout(settle, fallbackDelay);
    };

    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });

    return () => {
      window.removeEventListener('load', schedule);

      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
    };
  }, []);

  return isIdle;
};

export { fallbackDelay, useIdle };
