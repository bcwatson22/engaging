'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import type { CanvasProps } from './Canvas';

const Canvas = dynamic(async () => (await import('./Canvas')).Canvas, {
  ssr: false,
});

const idleTimeout = 2000;
const fallbackDelay = 200;

const Particles = (props: CanvasProps) => {
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

  return isReady ? <Canvas {...props} /> : null;
};

export { Particles };
