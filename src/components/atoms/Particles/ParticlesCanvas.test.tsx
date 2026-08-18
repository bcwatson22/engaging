import { cleanup, render, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import type { Mock } from 'vitest';

import { createField } from './engine';
import {
  defaultColor,
  ParticlesCanvas,
  type ParticlesCanvasProps,
} from './ParticlesCanvas';

vi.mock('./engine', () => ({
  createField: vi.fn<typeof import('./engine').createField>(),
}));

type Options = {
  isDark?: boolean;
  prefersReduced?: boolean;
  /* Left pending to stand in for a module still downloading. */
  isLoading?: boolean;
  fails?: boolean;
};

const destroy = vi.fn<() => void>();

/* Answers per query rather than a flat boolean: the component reads two, and
   a mock that matches everything would report reduced motion in every test
   about colour. */
const stubMediaQueries = ({ isDark = false, prefersReduced = false }) =>
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: query.includes('dark') ? isDark : prefersReduced,
        media: query,
        addEventListener: vi.fn<() => void>(),
        removeEventListener: vi.fn<() => void>(),
      }) as unknown as MediaQueryList,
  );

const setup = (
  { isDark, prefersReduced, isLoading, fails }: Options = {},
  props?: Partial<ParticlesCanvasProps>,
) => {
  stubMediaQueries({ isDark, prefersReduced });

  (createField as Mock).mockImplementation(() => {
    if (isLoading) return new Promise(() => {});
    if (fails) return Promise.reject(new Error('no wasm'));

    return Promise.resolve({ destroy });
  });

  return render(<ParticlesCanvas {...props} />);
};

const colorOf = (): string => (createField as Mock).mock.calls[0][1].color;

describe('ParticlesCanvas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  afterEach(() => vi.restoreAllMocks());

  it('renders a canvas', () => {
    const { container } = setup();

    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  /* Decoration. There is nothing here to announce, and a bare canvas in the
     accessibility tree is noise. */
  it('hides the canvas from assistive technology', () => {
    const { container } = setup();

    expect(container.querySelector('canvas')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('starts the field', async () => {
    setup();

    await waitFor(() => expect(createField).toHaveBeenCalledTimes(1));
  });

  it('stops the field when it unmounts', async () => {
    const { unmount } = setup();

    await waitFor(() => expect(createField).toHaveBeenCalledTimes(1));

    unmount();

    expect(destroy).toHaveBeenCalledTimes(1);
  });

  describe('reduced motion', () => {
    /* Halted, not slowed: no loop at all rather than a slower one. */
    it('never starts the field', () => {
      setup({ prefersReduced: true });

      expect(createField).toHaveBeenCalledTimes(0);
    });

    it('still renders the canvas', () => {
      const { container } = setup({ prefersReduced: true });

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('colour', () => {
    it('draws in white unless told otherwise', async () => {
      setup();

      await waitFor(() => expect(colorOf()).toBe(defaultColor));
    });

    it('draws in the colour it is given', async () => {
      setup({}, { color: '#245385' });

      await waitFor(() => expect(colorOf()).toBe('#245385'));
    });

    describe('on a dark scheme', () => {
      it('draws in the dark colour', async () => {
        setup({ isDark: true }, { color: '#245385', colorDark: '#f9fafb' });

        await waitFor(() => expect(colorOf()).toBe('#f9fafb'));
      });

      /* A page that looks the same either way passes one colour and should
         get it whichever way the query goes. */
      it('falls back to the single colour when no dark one is given', async () => {
        setup({ isDark: true }, { color: '#245385' });

        await waitFor(() => expect(colorOf()).toBe('#245385'));
      });
    });
  });

  describe('when the module does not arrive', () => {
    /* The page is correct without a decorative background, so a failed load
       is swallowed rather than raised to an error boundary. */
    it('does not throw', async () => {
      setup({ fails: true });

      await waitFor(() => expect(createField).toHaveBeenCalledTimes(1));

      expect(document.querySelector('canvas')).toBeInTheDocument();
    });
  });

  /* Unmounting while the module is still downloading would otherwise leave a
     field running with nothing to stop it. */
  it('stops a field that arrives after it unmounted', async () => {
    let settle: (field: { destroy: () => void }) => void = () => {};

    stubMediaQueries({});
    (createField as Mock).mockReturnValue(
      new Promise((resolve) => {
        settle = resolve;
      }),
    );

    const { unmount } = render(<ParticlesCanvas />);

    await waitFor(() => expect(createField).toHaveBeenCalledTimes(1));

    unmount();
    settle({ destroy });

    await waitFor(() => expect(destroy).toHaveBeenCalledTimes(1));
  });

  it('does not start a field while the module is still loading', async () => {
    setup({ isLoading: true });

    await waitFor(() => expect(createField).toHaveBeenCalledTimes(1));

    expect(destroy).toHaveBeenCalledTimes(0);
  });

  /* Rendered where there is no media query to read. The point is that it does
     not throw: useSyncExternalStore needs a server snapshot, and without one
     this component could not be rendered outside a browser at all. */
  it('renders without a scheme to read', () => {
    expect(() =>
      renderToString(<ParticlesCanvas color="#245385" />),
    ).not.toThrow();
  });
});
