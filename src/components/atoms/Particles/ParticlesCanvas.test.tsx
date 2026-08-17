import { cleanup, render, waitFor } from '@testing-library/react';
import { Particles as TSParticles } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { renderToString } from 'react-dom/server';
import type { Mock } from 'vitest';

import {
  defaultColor,
  ParticlesCanvas,
  type ParticlesCanvasProps,
} from './ParticlesCanvas';

vi.mock(import('@tsparticles/react'), async (importOriginal: Function) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Particles: vi.fn<typeof import('@tsparticles/react').Particles>(() => null),
  };
});

vi.mock('@tsparticles/slim', () => ({
  loadSlim: vi.fn<typeof import('@tsparticles/slim').loadSlim>(),
}));

const setup = (props?: Partial<ParticlesCanvasProps>) =>
  render(<ParticlesCanvas {...props} />);

/* The options the wrapper was handed. It reloads the field whenever this
   object's identity changes, so what is in it is what is on screen. */
const optionsOf = (particles: Mock) => particles.mock.calls[0][0].options;

const colorOf = (particles: Mock): string =>
  optionsOf(particles).particles.color.value;

describe('ParticlesCanvas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('loads the engine', () => {
    setup();

    expect(loadSlim).toHaveBeenCalledTimes(1);
  });

  it('renders the field', async () => {
    setup();

    await waitFor(() =>
      expect(TSParticles).toHaveBeenNthCalledWith(
        1,
        {
          id: expect.any(String),
          className: 'particles',
          options: expect.objectContaining({
            detectRetina: true,
          }),
        },
        undefined,
      ),
    );
  });

  /* Two fields on one page, or a navigation between two pages that each render
     one, would otherwise fight over the wrapper's default "tsparticles" id —
     it destroys any container it cannot find by that id. */
  it('gives each field its own id', () => {
    setup();
    const first = (TSParticles as Mock).mock.calls[0][0].id;

    cleanup();
    setup();

    const second = (TSParticles as Mock).mock.calls[1][0].id;

    expect(first).toBeTruthy();
    expect(second).not.toBe(first);
  });

  describe('colour', () => {
    it('draws in white unless told otherwise', () => {
      setup();

      expect(colorOf(TSParticles as Mock)).toBe(defaultColor);
    });

    /* The point of the prop. The options used to be memoised on an empty
       dependency array, so the colour was fixed at first render and no change
       to it could ever reach the canvas. */
    it('draws in the colour it is given', () => {
      setup({ color: '#245385' });

      expect(colorOf(TSParticles as Mock)).toBe('#245385');
    });

    describe('on a dark scheme', () => {
      beforeEach(() =>
        vi.spyOn(window, 'matchMedia').mockReturnValue({
          matches: true,
          addEventListener: vi.fn<() => void>(),
          removeEventListener: vi.fn<() => void>(),
        } as unknown as MediaQueryList),
      );

      afterEach(() => vi.restoreAllMocks());

      it('draws in the dark colour', () => {
        setup({ color: '#245385', colorDark: '#f9fafb' });

        expect(colorOf(TSParticles as Mock)).toBe('#f9fafb');
      });

      /* A page that looks the same either way passes one colour and should
         get it whichever way the query goes. */
      it('falls back to the single colour when no dark one is given', () => {
        setup({ color: '#245385' });

        expect(colorOf(TSParticles as Mock)).toBe('#245385');
      });
    });
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
