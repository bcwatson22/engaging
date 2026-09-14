import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

import {
  changeEvent,
  storageKey,
  useMotionPreference,
  type TMotion,
} from './useMotionPreference';

type SetupOptions = {
  stored?: TMotion;
  isStorageBlocked?: boolean;
};

const setup = ({ stored, isStorageBlocked = false }: SetupOptions = {}) => {
  if (stored) window.localStorage.setItem(storageKey, stored);

  if (isStorageBlocked) {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
  }

  return renderHook(() => useMotionPreference());
};

describe('useMotionPreference', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.motion;
  });

  afterEach(() => vi.restoreAllMocks());

  it('runs motion by default', () => {
    const { result } = setup();

    expect(result.current.isPaused).toBe(false);
  });

  it('reads a stored pause', () => {
    const { result } = setup({ stored: 'paused' });

    expect(result.current.isPaused).toBe(true);
  });

  it('mirrors the preference onto the root element', () => {
    setup({ stored: 'paused' });

    expect(document.documentElement).toHaveAttribute('data-motion', 'paused');
  });

  describe('toggle', () => {
    it('pauses running motion and remembers it', () => {
      const { result } = setup();

      act(() => result.current.toggle());

      expect(result.current.isPaused).toBe(true);
      expect(window.localStorage.getItem(storageKey)).toBe('paused');
      expect(document.documentElement).toHaveAttribute('data-motion', 'paused');
    });

    it('resumes paused motion', () => {
      const { result } = setup({ stored: 'paused' });

      act(() => result.current.toggle());

      expect(result.current.isPaused).toBe(false);
      expect(window.localStorage.getItem(storageKey)).toBe('running');
    });

    /* Every consumer on the page, not only the one that was pressed. */
    it('announces the change to the rest of the page', () => {
      const listener = vi.fn<() => void>();

      window.addEventListener(changeEvent, listener);

      const { result } = setup();

      act(() => result.current.toggle());

      expect(listener).toHaveBeenCalledTimes(1);

      window.removeEventListener(changeEvent, listener);
    });
  });

  it('follows a change made in another tab', () => {
    const { result } = setup();

    act(() => {
      window.localStorage.setItem(storageKey, 'paused');
      window.dispatchEvent(new StorageEvent('storage'));
    });

    expect(result.current.isPaused).toBe(true);
  });

  it('stops listening when unmounted', () => {
    const spyRemove = vi.spyOn(window, 'removeEventListener');

    const { unmount } = setup();

    unmount();

    expect(spyRemove).toHaveBeenNthCalledWith(
      1,
      'storage',
      expect.any(Function),
    );
    expect(spyRemove).toHaveBeenNthCalledWith(
      2,
      changeEvent,
      expect.any(Function),
    );
  });

  describe('when storage is blocked', () => {
    it('runs motion', () => {
      const { result } = setup({ isStorageBlocked: true });

      expect(result.current.isPaused).toBe(false);
    });

    it('does not throw when toggled', () => {
      const { result } = setup({ isStorageBlocked: true });

      expect(() => act(() => result.current.toggle())).not.toThrow();
    });
  });

  it('renders on the server without reading storage', () => {
    const Probe = () => String(useMotionPreference().isPaused);

    expect(renderToString(createElement(Probe))).toBe('false');
  });
});
