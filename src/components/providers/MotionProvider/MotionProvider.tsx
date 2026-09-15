'use client';

import { LazyMotion } from 'motion/react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const loadFeatures = () =>
  import('./domAnimationFeatures').then((module) => module.default);

const MotionProvider = ({ children }: Props) => (
  <LazyMotion features={loadFeatures}>{children}</LazyMotion>
);

export { MotionProvider };
export type { Props as MotionProviderProps };
