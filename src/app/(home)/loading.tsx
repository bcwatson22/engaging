'use client';

import type { NextPage } from 'next';

import { Transition } from '@/components/atoms/Transition/Transition';
import { MugshotSkeleton } from '@/components/organisms/Mugshot/Mugshot';

const LoadingPage: NextPage = () => (
  <Transition>
    <main id="main" className="home grow">
      <h1 className="sr-only">Engaging Engineering</h1>
      <MugshotSkeleton />
    </main>
  </Transition>
);

export default LoadingPage;
