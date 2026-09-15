import { renderHook } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import type { Mock } from 'vitest';

import { fallbackDelay, useIdlePrefetch } from './useIdlePrefetch';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn<typeof import('next/navigation').useRouter>(),
}));

type SetupOptions = {
  readyState?: DocumentReadyState;
  hasIdleCallback?: boolean;
};

const hrefs = ['/', '/cv', '/contact'];

const setup = (
  { readyState = 'complete', hasIdleCallback = false }: SetupOptions = {},
  params: string[] = hrefs,
) => {
  const prefetch = vi.fn<(href: string) => void>();

  (useRouter as Mock).mockReturnValue({ prefetch });

  vi.spyOn(document, 'readyState', 'get').mockReturnValue(readyState);

  const requestIdleCallback = vi
    .fn<typeof window.requestIdleCallback>()
    .mockImplementation((callback) => {
      callback({ didTimeout: false, timeRemaining: () => 50 });
      return 7;
    });
  const cancelIdleCallback = vi.fn<typeof window.cancelIdleCallback>();

  Object.assign(window, {
    requestIdleCallback: hasIdleCallback ? requestIdleCallback : undefined,
    cancelIdleCallback,
  });

  const hook = renderHook(() => useIdlePrefetch(params));

  return { prefetch, requestIdleCallback, cancelIdleCallback, ...hook };
};

describe('useIdlePrefetch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('prefetches nothing straight away', () => {
    const { prefetch } = setup();

    expect(prefetch).toHaveBeenCalledTimes(0);
  });

  it('prefetches every route once the page has loaded and settled', () => {
    const { prefetch } = setup();

    vi.advanceTimersByTime(fallbackDelay);

    for (const [index, href] of hrefs.entries())
      expect(prefetch).toHaveBeenNthCalledWith(index + 1, href);
  });

  it('waits for the load event on a page still loading', () => {
    const { prefetch } = setup({ readyState: 'loading' });

    vi.advanceTimersByTime(fallbackDelay);
    expect(prefetch).toHaveBeenCalledTimes(0);

    window.dispatchEvent(new Event('load'));
    vi.advanceTimersByTime(fallbackDelay);

    expect(prefetch).toHaveBeenCalledTimes(hrefs.length);
  });

  it('waits for the browser to be idle where it can', () => {
    const { prefetch, requestIdleCallback } = setup({ hasIdleCallback: true });

    expect(requestIdleCallback).toHaveBeenCalledTimes(1);
    expect(prefetch).toHaveBeenCalledTimes(hrefs.length);
  });

  it('cancels a pending idle callback when unmounted', () => {
    const { cancelIdleCallback, unmount } = setup({ hasIdleCallback: true });

    unmount();

    expect(cancelIdleCallback).toHaveBeenNthCalledWith(1, 7);
  });

  it('cancels a pending timeout when unmounted', () => {
    const { prefetch, unmount } = setup();

    unmount();
    vi.advanceTimersByTime(fallbackDelay);

    expect(prefetch).toHaveBeenCalledTimes(0);
  });

  it('stops waiting for load when unmounted first', () => {
    const { prefetch, unmount } = setup({ readyState: 'loading' });

    unmount();
    window.dispatchEvent(new Event('load'));
    vi.advanceTimersByTime(fallbackDelay);

    expect(prefetch).toHaveBeenCalledTimes(0);
  });

  it('does nothing without any routes', () => {
    const { prefetch } = setup({}, []);

    vi.advanceTimersByTime(fallbackDelay);

    expect(prefetch).toHaveBeenCalledTimes(0);
  });
});
