"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Particles as TSParticles,
  initParticlesEngine,
} from "@tsparticles/react";
import {
  type Container,
  type ISourceOptions,
  MoveDirection,
  OutMode,
} from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim"; // if you are going to use `loadSlim`, install the "@tsparticles/slim" package too.

const Particles = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log(container);
  };

  const options: ISourceOptions = useMemo(
    () => ({
      // background: {
      //   color: {
      //     value: "#0d47a1",
      //   },
      // },
      // fpsLimit: 120,
      // interactivity: {
      //   events: {
      //     onClick: {
      //       enable: true,
      //       mode: "push",
      //     },
      //     onHover: {
      //       enable: true,
      //       mode: "repulse",
      //     },
      //   },
      //   modes: {
      //     push: {
      //       quantity: 4,
      //     },
      //     repulse: {
      //       distance: 200,
      //       duration: 0.4,
      //     },
      //   },
      // },
      // particles: {
      //   color: {
      //     value: "#ffffff",
      //   },
      //   links: {
      //     color: "#ffffff",
      //     distance: 150,
      //     enable: true,
      //     opacity: 0.5,
      //     width: 1,
      //   },
      //   move: {
      //     direction: MoveDirection.none,
      //     enable: true,
      //     outModes: {
      //       default: OutMode.out,
      //     },
      //     random: false,
      //     speed: 6,
      //     straight: false,
      //   },
      //   number: {
      //     density: {
      //       enable: true,
      //     },
      //     value: 80,
      //   },
      //   opacity: {
      //     value: 0.5,
      //   },
      //   shape: {
      //     type: "circle",
      //   },
      //   size: {
      //     value: { min: 1, max: 5 },
      //   },
      // },
      // detectRetina: true,
      particles: {
        number: {
          value: 600,
          density: {
            enable: true,
            // value_area: 40,
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

  if (init) {
    return (
      // <div className="particles">
      <TSParticles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={options}
      />
      // </div>
    );
  }

  return <></>;
};

export { Particles };
