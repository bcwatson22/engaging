// "use client";

import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "../styles/globals.css";
import { FC, useCallback } from "react";
import type { Container, Engine } from "tsparticles-engine";
import Particles from "react-tsparticles";
//import { loadFull } from "tsparticles"; // if you are going to use `loadFull`, install the "tsparticles" package too.
import { loadSlim } from "tsparticles-slim";

import { type CssVariable } from "next/dist/compiled/@next/font";

const variable = "--font-sans" as const satisfies CssVariable;

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans" satisfies typeof variable,
});

export const metadata: Metadata = {
  title: `Create Next App`,
  description: `Generated by create next app`,
};

const RootLayout: FC<Layout> = ({ children }) => {
  // const particlesInit = useCallback(async (engine: Engine) => {
  //   console.log(engine);

  //   // you can initialize the tsParticles instance (engine) here, adding custom shapes or presets
  //   // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
  //   // starting from v2 you can add only the features you need reducing the bundle size
  //   //await loadFull(engine);
  //   await loadSlim(engine);
  // }, []);

  // const particlesLoaded = useCallback(
  //   async (container: Container | undefined) => {
  //     await console.log(container);
  //   },
  //   []
  // );

  return (
    <html lang="en">
      <body className={`cv ${nunito.className}`}>
        {/* <Particles
          id="tsparticles"
          init={particlesInit}
          loaded={particlesLoaded}
          options={{
            background: {
              color: {
                value: "#0d47a1",
              },
            },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: {
                  enable: true,
                  mode: "push",
                },
                onHover: {
                  enable: true,
                  mode: "repulse",
                },
                resize: true,
              },
              modes: {
                push: {
                  quantity: 4,
                },
                repulse: {
                  distance: 200,
                  duration: 0.4,
                },
              },
            },
            particles: {
              color: {
                value: "#ffffff",
              },
              links: {
                color: "#ffffff",
                distance: 150,
                enable: true,
                opacity: 0.5,
                width: 1,
              },
              move: {
                direction: "none",
                enable: true,
                outModes: {
                  default: "bounce",
                },
                random: false,
                speed: 6,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                  area: 800,
                },
                value: 80,
              },
              opacity: {
                value: 0.5,
              },
              shape: {
                type: "circle",
              },
              size: {
                value: { min: 1, max: 5 },
              },
            },
            detectRetina: true,
          }}
        /> */}
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
