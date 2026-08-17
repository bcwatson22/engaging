'use client';

import type { Engine, ISourceOptions } from '@tsparticles/engine';
import {
  Particles as TSParticles,
  ParticlesProvider,
} from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { useCallback, useMemo } from 'react';

/* Split out of Particles so that the engine — the single largest chunk the
   client downloads, and none of it needed to paint the page — sits behind a
   dynamic import rather than in the initial bundle. Particles owns the
   decision of when to load this; this file is only the canvas. */
const ParticlesCanvas = () => {
  /* v4 replaced initParticlesEngine with a provider. TSParticles reads the
     loaded flag off its context, so it no longer needs a render gate here. */
  const init = useCallback(async (engine: Engine): Promise<void> => {
    await loadSlim(engine);
  }, []);

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
          value: '#ffffff',
        },
        shape: {
          type: 'circle',
          polygon: {
            nb_sides: 5,
          },
        },
        opacity: {
          value: 0.3,
          random: true,
        },
        size: {
          value: 2.2,
          random: true,
        },
        lineLinked: {
          enable: false,
        },
        move: {
          enable: true,
          speed: 0.25,
          direction: 'none',
          random: false,
          straight: false,
          out_mode: 'out',
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
    [],
  );

  return (
    <ParticlesProvider init={init}>
      <TSParticles id="tsparticles" options={options} className="particles" />
    </ParticlesProvider>
  );
};

export { ParticlesCanvas };
