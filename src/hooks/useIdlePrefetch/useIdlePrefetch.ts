import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/* Next prefetches a link as soon as it is on screen, which for the nav means
   during the initial load: the requests start while the page is still
   painting, and Lighthouse's simulated slow 4G charges every request started
   before Largest Contentful Paint to it. The nav's routes are only needed once
   someone goes to leave the page, so they are fetched after the load event,
   when the browser is next idle. The timeout is the backstop for a browser that
   never goes idle; the setTimeout branch is for Safari before 18.4, which has no
   requestIdleCallback. */
const idleTimeout = 3000;
const fallbackDelay = 1500;

const useIdlePrefetch = (hrefs: string[]): void => {
  const router = useRouter();
  const key = hrefs.join(' ');

  useEffect(() => {
    if (!key) return;

    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;

    const prefetch = (): void => {
      for (const href of key.split(' ')) router.prefetch(href);
    };

    const schedule = (): void => {
      if (typeof window.requestIdleCallback === 'function') {
        idleHandle = window.requestIdleCallback(prefetch, {
          timeout: idleTimeout,
        });

        return;
      }

      timeoutHandle = window.setTimeout(prefetch, fallbackDelay);
    };

    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });

    return () => {
      window.removeEventListener('load', schedule);

      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
    };
  }, [key, router]);
};

export { fallbackDelay, useIdlePrefetch };
