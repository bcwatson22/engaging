import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { Particles as TSParticles } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { renderToString } from 'react-dom/server';
import type { Mock } from 'vitest';

import { defaultColor, Particles, type ParticlesProps } from './Particles';

vi.mock(import('@tsparticles/react'), async (importOriginal: Function) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Particles: vi.fn<typeof import('@tsparticles/react').Particles>(),
  };
});

vi.mock('@tsparticles/slim', () => ({
  loadSlim: vi.fn<typeof import('@tsparticles/slim').loadSlim>(),
}));

(TSParticles as Mock).mockImplementation(() => <div>Test particles</div>);

const setup = (props?: Partial<ParticlesProps>) =>
  render(<Particles {...props} />);

/* The options the wrapper was handed. It reloads the field whenever this
   object's identity changes, so what is in it is what is on screen. */
const optionsOf = (particles: Mock) => particles.mock.calls[0][0].options;

describe('Particles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('initialises and renders Particles', async () => {
    setup();

    expect(loadSlim).toHaveBeenCalledTimes(1);

    await waitFor(() =>
      expect(screen.getByText('Test particles')).toBeInTheDocument(),
    );
  });

  it('draws in white unless told otherwise', () => {
    setup();

    expect(optionsOf(TSParticles as Mock).particles.color.value).toBe(
      defaultColor,
    );
  });

  /* The point of the prop. The options used to be memoised on an empty
     dependency array, so the colour was fixed at first render and no change
     to it could ever reach the canvas. */
  it('draws in the colour it is given', () => {
    setup({ color: '#245385' });

    expect(optionsOf(TSParticles as Mock).particles.color.value).toBe(
      '#245385',
    );
  });

  it('keeps the light colour on a dark scheme when given only one', () => {
    setup({ color: '#245385' });

    expect(optionsOf(TSParticles as Mock).particles.color.value).toBe(
      '#245385',
    );
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

      expect(optionsOf(TSParticles as Mock).particles.color.value).toBe(
        '#f9fafb',
      );
    });

    /* A page that looks the same in either scheme passes one colour and
       should get it whichever way the query goes. */
    it('falls back to the single colour when no dark one is given', () => {
      setup({ color: '#245385' });

      expect(optionsOf(TSParticles as Mock).particles.color.value).toBe(
        '#245385',
      );
    });
  });

  /* Server-rendered, where there is no media query to read. The point is that
     it does not throw: useSyncExternalStore needs a server snapshot, and
     without one this component cannot be rendered on the server at all. */
  it('renders on the server without a scheme to read', () => {
    expect(() => renderToString(<Particles color="#245385" />)).not.toThrow();
  });

  /* Two fields on one page, or a client-side navigation between two pages
     that each render one, would otherwise fight over the wrapper's default
     "tsparticles" id — it destroys any container it cannot find by that id. */
  it('gives each field its own id', () => {
    const { unmount } = setup();
    const first = (TSParticles as Mock).mock.calls[0][0].id;

    unmount();
    cleanup();
    setup();

    const second = (TSParticles as Mock).mock.calls[1][0].id;

    expect(first).toBeTruthy();
    expect(second).not.toBe(first);
  });
});
