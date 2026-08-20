'use client';

import type { NextPage } from 'next';

import { MugshotSkeleton } from '@/components/organisms/Mugshot/Mugshot';

/* Mirrors `page.tsx`. This shell is what the browser paints while the rest of
   the streamed document parses, and `.home` centres its column, so anything
   present in one and not the other shifts everything above it the moment React
   swaps the real page in.

   The nav and the footer used to be that hazard and are no longer: both come
   from the layout this renders inside, so they are on screen either way and
   cannot differ. Particles are not mirrored, but the canvas is fixed-position
   and the element it mounts into has no height, so it cannot shift anything. */
const LoadingPage: NextPage = () => (
  <main className="home grow">
    <h1 className="sr-only">Engaging Engineering</h1>
    <MugshotSkeleton />
  </main>
);

export default LoadingPage;
