'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';

import { createField, type Field } from './engine';

type Props = {
  /* On a light scheme. */
  color?: string;
  /* On a dark one. Defaults to `color`, so a page that looks the same in both
     — the home page — passes one value and gets one behaviour. */
  colorDark?: string;
};

const defaultColor = '#ffffff';

const darkQuery = '(prefers-color-scheme: dark)';
const motionQuery = '(prefers-reduced-motion: reduce)';

/* Subscribed to rather than read once: someone switching their system
   appearance or their motion preference with the page open should see the
   field follow, and a media query read inside an effect would not. */
const watch = (query: string) => {
  const subscribe = (onChange: () => void): (() => void) => {
    const list = window.matchMedia(query);

    list.addEventListener('change', onChange);

    return () => list.removeEventListener('change', onChange);
  };

  const get = (): boolean => window.matchMedia(query).matches;

  return { subscribe, get };
};

const dark = watch(darkQuery);
const reduced = watch(motionQuery);

/* Assumed where there is no media query to read. Dark rather than light
   because the canvas is only painted after mount, so this value never reaches
   the screen — it only has to be stable. Reduced motion is assumed on for the
   same reason it is honoured at all: doing nothing is the safe default. */
const isDarkOnServer = (): boolean => true;
const isReducedOnServer = (): boolean => true;

const ParticlesCanvas = ({
  color = defaultColor,
  colorDark = color,
}: Props) => {
  const isDark = useSyncExternalStore(dark.subscribe, dark.get, isDarkOnServer);
  const prefersReduced = useSyncExternalStore(
    reduced.subscribe,
    reduced.get,
    isReducedOnServer,
  );

  const active = isDark ? colorDark : color;
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    /* Halted, not slowed. Reduced motion means no animation loop at all, so
       the canvas stays empty rather than drifting imperceptibly. */
    if (prefersReduced || !ref.current) return;

    let field: Field | undefined;
    let cancelled = false;

    createField(ref.current, { color: active })
      .then((created) => {
        /* Unmounted while the module was still loading. */
        if (cancelled) {
          created.destroy();
          return;
        }

        field = created;
      })
      /* The module failing to load is not worth an error boundary — the page
         is correct without a decorative background. */
      .catch(() => {});

    return () => {
      cancelled = true;
      field?.destroy();
    };
  }, [active, prefersReduced]);

  /* aria-hidden because it is decoration: there is nothing here to announce,
     and a bare canvas in the accessibility tree is noise. */
  return <canvas ref={ref} className="particles" aria-hidden="true" />;
};

export { ParticlesCanvas, defaultColor };
export type { Props as ParticlesCanvasProps };
