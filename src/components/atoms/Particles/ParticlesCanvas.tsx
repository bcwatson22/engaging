'use client';

import { createField, defaultOpacity, type Field } from '@bcwatson22/motes';
import { useEffect, useRef, useSyncExternalStore } from 'react';

type Props = {
  /* On a light scheme. */
  color?: string;
  /* On a dark one. Defaults to `color`, so a page that looks the same in both
     — the home page — passes one value and gets one behaviour. */
  colorDark?: string;
  /* How solid a particle is at rest, 0 to 1. Worth raising on a light page:
     a dark colour at the default 0.3 composites against near-white to
     something close to grey. */
  opacity?: number;
  /* And on a dark one. Defaults to `opacity`, matching the colour props. */
  opacityDark?: number;
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
  opacity = defaultOpacity,
  opacityDark = opacity,
}: Props) => {
  const isDark = useSyncExternalStore(dark.subscribe, dark.get, isDarkOnServer);
  const prefersReduced = useSyncExternalStore(
    reduced.subscribe,
    reduced.get,
    isReducedOnServer,
  );

  const active = isDark ? colorDark : color;
  const activeOpacity = isDark ? opacityDark : opacity;
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    /* The package honours reduced motion itself, drawing a single static
       frame. This gate is kept anyway because it is stricter: no module is
       instantiated and no canvas context is taken, so the preference costs
       nothing at all rather than costing one frame. */
    if (prefersReduced || !ref.current) return;

    let field: Field | undefined;
    let cancelled = false;

    createField(ref.current, { color: active, opacity: activeOpacity })
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
  }, [active, activeOpacity, prefersReduced]);

  /* aria-hidden because it is decoration: there is nothing here to announce,
     and a bare canvas in the accessibility tree is noise. */
  return <canvas ref={ref} className="particles" aria-hidden="true" />;
};

export { ParticlesCanvas, defaultColor };
export type { Props as ParticlesCanvasProps };
