import type { NextPage } from 'next';

import { title } from './page';

/* Mirrors `page.tsx`, and exists because the group's loading.tsx does not.
   That one mirrors the home page — a route group's loading UI applies to every
   route inside it, so without this the status page streamed in behind the home
   page's skeleton, h1 and all.

   Nothing else in the group hits this: the other pages are fully static, so
   there is no boundary to fall back to. This one awaits the service.

   Deliberately empty below the heading rather than a skeleton of the panel.
   What arrives depends on what the service reports — an artifact may have no
   history, the sweep may never have run — so any shape drawn here would be a
   guess, and guessing wrong shifts the page when the real answer lands. */
const LoadingStatus: NextPage = () => (
  <main className="status grow">
    <h1 className="sr-only">{title}</h1>
  </main>
);

export default LoadingStatus;
