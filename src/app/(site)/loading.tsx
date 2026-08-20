'use client';

import type { NextPage } from 'next';

import { Copyright } from '@/components/atoms/Copyright/Copyright';
import { MugshotSkeleton } from '@/components/organisms/Mugshot/Mugshot';

/* Mirrors `page.tsx` exactly, footer included. This shell is what the browser
   paints while the rest of the streamed document parses, and `.home` centres
   its column, so a footer here and not there moved everything above it by
   half the footer's height the moment React swapped the real page in.
   Particles are the one thing not mirrored: the canvas is fixed-position and
   the element it mounts into has no height, so it cannot shift anything. */
const LoadingPage: NextPage = () => (
  <main className="home grow">
    <h1 className="sr-only">Engaging Engineering</h1>
    <MugshotSkeleton />
    <footer className="footer">
      <Copyright />
    </footer>
  </main>
);

export default LoadingPage;
