import { cleanup, render, waitFor } from '@testing-library/react';
import { Particles as TSParticles } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

import { ParticlesCanvas } from './ParticlesCanvas';

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

const setup = () => render(<ParticlesCanvas />);

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
          id: 'tsparticles',
          className: 'particles',
          options: expect.objectContaining({
            detectRetina: true,
          }),
        },
        undefined,
      ),
    );
  });
});
