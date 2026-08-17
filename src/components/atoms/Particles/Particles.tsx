'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

/* ssr: false because there is nothing to render on the server — the canvas is
   painted by the engine after mount — and because it keeps the engine out of
   the initial client bundle entirely. */
const ParticlesCanvas = dynamic(
  async () => (await import('./ParticlesCanvas')).ParticlesCanvas,
  { ssr: false },
);

/* Background decoration, so it has no business competing with the page for
   bandwidth or main thread while that page is still painting. Waiting for
   idle pushes both the chunk and the engine's setup past LCP. The timeout is
   the backstop for a browser that never goes idle; the setTimeout branch is
   for Safari, which only shipped requestIdleCallback in 18.4. */
const idleTimeout = 2000;
const fallbackDelay = 200;

const Particles = () => {
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(() => setIsReady(true), {
        timeout: idleTimeout,
      });

      return () => window.cancelIdleCallback(handle);
    }

    const handle = window.setTimeout(() => setIsReady(true), fallbackDelay);

    return () => window.clearTimeout(handle);
  }, []);

  return isReady ? <ParticlesCanvas /> : null;
};

export { Particles };
