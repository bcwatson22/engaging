'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

type Motion = 'paused' | 'running';

type Return = {
  isPaused: boolean;
  toggle: () => void;
};

const storageKey = 'motion';
const changeEvent = 'motionchange';

/* WCAG 2.2.2 wants a way to stop anything that moves for more than five
   seconds alongside other content. prefers-reduced-motion is a system-wide
   switch that many people never find, so it is honoured but not relied on:
   this is the page's own control, remembered between visits.

   localStorage has no same-tab change event — `storage` only fires in other
   tabs — so a custom one is dispatched alongside every write, and both are
   listened for. That keeps every consumer on the page (the toggle, the
   particle field) in step with the one that changed it. */
const read = (): Motion => {
  try {
    return window.localStorage.getItem(storageKey) === 'paused'
      ? 'paused'
      : 'running';
  } catch {
    /* Storage can be blocked outright, in which case motion just runs. */
    return 'running';
  }
};

const subscribe = (onChange: () => void): (() => void) => {
  window.addEventListener('storage', onChange);
  window.addEventListener(changeEvent, onChange);

  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(changeEvent, onChange);
  };
};

/* Running on the server: the stored choice cannot be known there, and the
   CSS pause only applies once the attribute below is set. */
const readOnServer = (): Motion => 'running';

const write = (motion: Motion): void => {
  try {
    window.localStorage.setItem(storageKey, motion);
  } catch {
    /* Not persisted, but still applied for this page view. */
  }

  window.dispatchEvent(new Event(changeEvent));
};

const useMotionPreference = (): Return => {
  const motion = useSyncExternalStore(subscribe, read, readOnServer);
  const isPaused = motion === 'paused';

  /* Mirrored onto the root so CSS animations can be paused with a selector
     rather than every animated component reading this hook. */
  useEffect(() => {
    document.documentElement.dataset.motion = motion;
  }, [motion]);

  const toggle = useCallback(
    (): void => write(isPaused ? 'running' : 'paused'),
    [isPaused],
  );

  return { isPaused, toggle };
};

export { useMotionPreference, storageKey, changeEvent };
export type { Return, Motion };
