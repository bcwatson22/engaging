import { act, renderHook } from '@testing-library/react';

import { fallbackDelay, useIdle } from './useIdle';

type SetupOptions = {
  readyState?: DocumentReadyState;
  hasIdleCallback?: boolean;
};

const setup = ({
  readyState = 'complete',
  hasIdleCallback = false,
}: SetupOptions = {}) => {
  vi.spyOn(document, 'readyState', 'get').mockReturnValue(readyState);

  let runIdle: (() => void) | undefined;

  const requestIdleCallback = vi
    .fn<typeof window.requestIdleCallback>()
    .mockImplementation((callback) => {
      runIdle = () => callback({ didTimeout: false, timeRemaining: () => 50 });
      return 7;
    });
  const cancelIdleCallback = vi.fn<typeof window.cancelIdleCallback>();

  Object.assign(window, {
    requestIdleCallback: hasIdleCallback ? requestIdleCallback : undefined,
    cancelIdleCallback,
  });

  const hook = renderHook(() => useIdle());

  return {
    requestIdleCallback,
    cancelIdleCallback,
    runIdle: () => act(() => runIdle?.()),
    ...hook,
  };
};

describe('useIdle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('is not idle straight away', () => {
    const { result } = setup();

    expect(result.current).toBe(false);
  });

  it('is idle once the page has loaded and settled', () => {
    const { result } = setup();

    act(() => {
      vi.advanceTimersByTime(fallbackDelay);
    });

    expect(result.current).toBe(true);
  });

  it('waits for the load event on a page still loading', () => {
    const { result } = setup({ readyState: 'loading' });

    act(() => {
      vi.advanceTimersByTime(fallbackDelay);
    });
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('load'));
      vi.advanceTimersByTime(fallbackDelay);
    });

    expect(result.current).toBe(true);
  });

  it('waits for the browser to be idle where it can', () => {
    const { result, requestIdleCallback, runIdle } = setup({
      hasIdleCallback: true,
    });

    expect(requestIdleCallback).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(false);

    runIdle();

    expect(result.current).toBe(true);
  });

  it('cancels a pending idle callback when unmounted', () => {
    const { cancelIdleCallback, unmount } = setup({ hasIdleCallback: true });

    unmount();

    expect(cancelIdleCallback).toHaveBeenNthCalledWith(1, 7);
  });

  it('cancels a pending timeout when unmounted', () => {
    const clearTimeout = vi.spyOn(window, 'clearTimeout');
    const { unmount } = setup();

    unmount();

    expect(clearTimeout).toHaveBeenCalledTimes(1);
  });

  it('stops waiting for load when unmounted first', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    const { unmount } = setup({ readyState: 'loading' });

    unmount();

    expect(removeEventListener).toHaveBeenNthCalledWith(
      1,
      'load',
      expect.any(Function),
    );
  });
});
