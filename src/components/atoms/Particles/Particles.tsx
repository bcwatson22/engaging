"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Particles as TSParticles,
  initParticlesEngine,
} from "@tsparticles/react";
import { type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim"; // if you are going to use `loadSlim`, install the "@tsparticles/slim" package too.

const Particles = () => {
  const [init, setInit] = useState<boolean>(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
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
          value: "#ffffff",
        },
        shape: {
          type: "circle",
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
          direction: "none",
          random: false,
          straight: false,
          out_mode: "out",
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
            mode: "bubble",
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
    []
  );

  return init ? (
    <TSParticles id="tsparticles" options={options} className="particles" />
  ) : null;
};

export { Particles };
