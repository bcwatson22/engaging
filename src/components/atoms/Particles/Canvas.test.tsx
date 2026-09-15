import {
  createField,
  defaults,
  type Options as FieldOptions,
} from '@bcwatson22/motes';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import type { Mock } from 'vitest';

import {
  changeEvent,
  storageKey,
} from '@/hooks/useMotionPreference/useMotionPreference';

import { defaultColor, Canvas, type CanvasProps } from './Canvas';

vi.mock('@bcwatson22/motes', () => ({
  createField: vi.fn<typeof import('@bcwatson22/motes').createField>(),
  defaults: { opacity: 0.3 },
}));

type Options = {
  isDark?: boolean;
  isPaused?: boolean;
  prefersReduced?: boolean;
  isLoading?: boolean;
  fails?: boolean;
};

const color = '#245385';
const colorDark = '#f9fafb';
const opacity = 0.55;
const opacityDark = 0.8;

const destroy = vi.fn<() => void>();
const pause = vi.fn<() => void>();
const resume = vi.fn<() => void>();

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
  { isDark, prefersReduced, isPaused = false, isLoading, fails }: Options = {},
  props?: Partial<CanvasProps>,
) => {
  stubMediaQueries({ isDark, prefersReduced });
  window.localStorage.setItem(storageKey, isPaused ? 'paused' : 'running');

  (createField as Mock).mockImplementation(() => {
    if (isLoading) return new Promise(() => {});
    if (fails) return Promise.reject(new Error('no wasm'));

    return Promise.resolve({ pause, resume, destroy });
  });

  return render(<Canvas {...props} />);
};

const argsWith = (options: Partial<FieldOptions>): unknown[] => [
  expect.any(HTMLCanvasElement),
  expect.objectContaining(options),
];

describe('Canvas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  afterEach(() => vi.restoreAllMocks());

  it('renders a canvas', () => {
    const { container } = setup();

    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

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
    it('never starts the field', () => {
      setup({ prefersReduced: true });

      expect(createField).toHaveBeenCalledTimes(0);
    });

    it('still renders the canvas', () => {
      const { container } = setup({ prefersReduced: true });

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('paused by the visitor', () => {
    const setMotion = (value: 'paused' | 'running') =>
      act(() => {
        window.localStorage.setItem(storageKey, value);
        window.dispatchEvent(new Event(changeEvent));
      });

    it('pauses a field that arrives while already paused', async () => {
      setup({ isPaused: true });

      await waitFor(() => expect(pause).toHaveBeenCalledTimes(1));
    });

    it('lets a field run when not paused', async () => {
      setup();

      await waitFor(() => expect(resume).toHaveBeenCalledTimes(1));

      expect(pause).toHaveBeenCalledTimes(0);
    });

    it('pauses the running field rather than replacing it', async () => {
      setup();

      await waitFor(() => expect(resume).toHaveBeenCalledTimes(1));

      setMotion('paused');

      expect(pause).toHaveBeenCalledTimes(1);
      expect(destroy).toHaveBeenCalledTimes(0);
      expect(createField).toHaveBeenCalledTimes(1);
    });

    it('resumes the same field when played again', async () => {
      setup();

      await waitFor(() => expect(resume).toHaveBeenCalledTimes(1));

      setMotion('paused');
      setMotion('running');

      expect(resume).toHaveBeenCalledTimes(2);
      expect(createField).toHaveBeenCalledTimes(1);
    });
  });

  describe('colour', () => {
    it('draws in white unless told otherwise', async () => {
      setup();

      await waitFor(() =>
        expect(createField).toHaveBeenNthCalledWith(
          1,
          ...argsWith({ color: defaultColor }),
        ),
      );
    });

    it('draws in the colour it is given', async () => {
      setup({}, { color });

      await waitFor(() =>
        expect(createField).toHaveBeenNthCalledWith(1, ...argsWith({ color })),
      );
    });

    describe('on a dark scheme', () => {
      it('draws in the dark colour', async () => {
        setup({ isDark: true }, { color, colorDark });

        await waitFor(() =>
          expect(createField).toHaveBeenNthCalledWith(
            1,
            ...argsWith({ color: colorDark }),
          ),
        );
      });

      it('falls back to the single colour when no dark one is given', async () => {
        setup({ isDark: true }, { color });

        await waitFor(() =>
          expect(createField).toHaveBeenNthCalledWith(
            1,
            ...argsWith({ color }),
          ),
        );
      });
    });
  });

  describe('opacity', () => {
    it('rests at the default unless told otherwise', async () => {
      setup();

      await waitFor(() =>
        expect(createField).toHaveBeenNthCalledWith(
          1,
          ...argsWith({ opacity: defaults.opacity }),
        ),
      );
    });

    it('rests at the opacity it is given', async () => {
      setup({}, { opacity });

      await waitFor(() =>
        expect(createField).toHaveBeenNthCalledWith(
          1,
          ...argsWith({ opacity }),
        ),
      );
    });

    describe('on a dark scheme', () => {
      it('uses the dark opacity', async () => {
        setup({ isDark: true }, { opacity, opacityDark });

        await waitFor(() =>
          expect(createField).toHaveBeenNthCalledWith(
            1,
            ...argsWith({ opacity: opacityDark }),
          ),
        );
      });

      it('falls back to the single opacity when no dark one is given', async () => {
        setup({ isDark: true }, { opacity });

        await waitFor(() =>
          expect(createField).toHaveBeenNthCalledWith(
            1,
            ...argsWith({ opacity }),
          ),
        );
      });
    });
  });

  describe('when the module does not arrive', () => {
    it('does not throw', async () => {
      setup({ fails: true });

      await waitFor(() => expect(createField).toHaveBeenCalledTimes(1));

      expect(document.querySelector('canvas')).toBeInTheDocument();
    });
  });

  it('stops a field that arrives after it unmounted', async () => {
    let settle: (field: { destroy: () => void }) => void = () => {};

    stubMediaQueries({});
    (createField as Mock).mockReturnValue(
      new Promise((resolve) => {
        settle = resolve;
      }),
    );

    const { unmount } = render(<Canvas />);

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

  it('renders without a scheme to read', () => {
    expect(() => renderToString(<Canvas color={color} />)).not.toThrow();
  });
});
