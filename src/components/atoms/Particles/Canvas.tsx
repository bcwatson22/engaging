'use client';

import { createField, defaults, type Field } from '@bcwatson22/motes';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { useMotionPreference } from '@/hooks/useMotionPreference/useMotionPreference';

type Props = {
  color?: string;
  colorDark?: string;
  opacity?: number;
  opacityDark?: number;
};

const defaultColor = '#ffffff';

const darkQuery = '(prefers-color-scheme: dark)';
const motionQuery = '(prefers-reduced-motion: reduce)';

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

const isDarkOnServer = (): boolean => true;
const isReducedOnServer = (): boolean => true;

const Canvas = ({
  color = defaultColor,
  colorDark = color,
  opacity = defaults.opacity,
  opacityDark = opacity,
}: Props) => {
  const isDark = useSyncExternalStore(dark.subscribe, dark.get, isDarkOnServer);
  const prefersReduced = useSyncExternalStore(
    reduced.subscribe,
    reduced.get,
    isReducedOnServer,
  );
  const { isPaused } = useMotionPreference();

  const active = isDark ? colorDark : color;
  const activeOpacity = isDark ? opacityDark : opacity;
  const ref = useRef<HTMLCanvasElement>(null);
  const [field, setField] = useState<Field | null>(null);

  useEffect(() => {
    if (!field) return;

    if (isPaused) field.pause();
    else field.resume();
  }, [field, isPaused]);

  useEffect(() => {
    if (prefersReduced || !ref.current) return;

    let cancelled = false;
    let created: Field | undefined;

    createField(ref.current, { color: active, opacity: activeOpacity })
      .then((next) => {
        if (cancelled) {
          next.destroy();
          return;
        }

        created = next;
        setField(next);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      created?.destroy();
      setField(null);
    };
  }, [active, activeOpacity, prefersReduced]);

  return <canvas ref={ref} className="particles" aria-hidden="true" />;
};

export { Canvas, defaultColor };
export type { Props as CanvasProps };
