'use client';

import type { Engine, ISourceOptions } from '@tsparticles/engine';
import {
  Particles as TSParticles,
  ParticlesProvider,
} from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { useCallback, useId, useMemo, useSyncExternalStore } from 'react';

type Props = {
  /* On a light scheme. */
  color?: string;
  /* On a dark one. Defaults to `color`, so a page that looks the same in both
     — the home page — passes one value and gets one behaviour. */
  colorDark?: string;
};

const defaultColor = '#ffffff';

const darkQuery = '(prefers-color-scheme: dark)';

const subscribe = (onChange: () => void): (() => void) => {
  const query = window.matchMedia(darkQuery);

  query.addEventListener('change', onChange);

  return () => query.removeEventListener('change', onChange);
};

const isDarkNow = (): boolean => window.matchMedia(darkQuery).matches;

/* Assumed where there is no scheme to read. Dark rather than light because the
   canvas is only painted after mount, so this value never reaches the screen —
   it only has to be stable. */
const isDarkOnServer = (): boolean => true;

/* Split out of Particles so that the engine — the single largest chunk the
   client downloads, and none of it needed to paint the page — sits behind a
   dynamic import rather than in the initial bundle. Particles owns the
   decision of when to load this; this file is only the canvas. */
const ParticlesCanvas = ({
  color = defaultColor,
  colorDark = color,
}: Props) => {
  /* Subscribed to rather than read once: someone switching their system
     appearance with the page open should see the field follow, and a media
     query read inside a memo would not. */
  const isDark = useSyncExternalStore(subscribe, isDarkNow, isDarkOnServer);

  const active = isDark ? colorDark : color;

  /* Unique per instance. The wrapper falls back to a hardcoded "tsparticles"
     id and destroys any container whose element it cannot find by that id — so
     two of these on one page, or a navigation between two pages that each
     render one, would fight over the same container. */
  const id = useId();

  /* v4 replaced initParticlesEngine with a provider. TSParticles reads the
     loaded flag off its context, so it no longer needs a render gate here. */
  const init = useCallback(async (engine: Engine): Promise<void> => {
    await loadSlim(engine);
  }, []);

  /* `active` in the dependencies, not an empty array. The wrapper reloads the
     container when this object's identity changes, so a memo that never
     recomputes is a colour that can never change. */
  const options: ISourceOptions = useMemo(
    () => ({
      particles: {
        number: {
          value: 600,
          density: {
            enable: true,
          },
        },
        color: {
          value: active,
        },
        shape: {
          type: 'circle',
        },
        opacity: {
          value: 0.3,
        },
        size: {
          value: 2.2,
        },
        /* `outModes`, not the `out_mode` this carried before — that is a v1/v2
           name absent from v4's types and silently ignored, so the setting was
           never applied. `lineLinked`, `nb_sides` and `random` were the same
           and have gone; `random: true` in particular means opacity and size
           have been uniform rather than varied. Restore that deliberately with
           `value: { min, max }` if it is wanted. */
        move: {
          enable: true,
          speed: 0.25,
          direction: 'none',
          random: false,
          straight: false,
          outModes: 'out',
          bounce: false,
          attract: {
            enable: false,
          },
        },
      },
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: 'bubble',
          },
        },
        modes: {
          bubble: {
            distance: 175,
            size: 4,
            duration: 2,
            opacity: 0.6,
            speed: 3,
          },
        },
      },
      detectRetina: true,
    }),
    [active],
  );

  return (
    <ParticlesProvider init={init}>
      <TSParticles id={id} options={options} className="particles" />
    </ParticlesProvider>
  );
};

export { ParticlesCanvas, defaultColor };
export type { Props as ParticlesCanvasProps };
