import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { Particles as TSParticles } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Mock } from 'vitest';

import { ParticlesCanvas } from './ParticlesCanvas';

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

const setup = () => render(<ParticlesCanvas />);

describe('ParticlesCanvas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('initialises and renders the canvas', async () => {
    setup();

    expect(loadSlim).toHaveBeenCalledTimes(1);

    await waitFor(() =>
      expect(screen.getByText('Test particles')).toBeInTheDocument(),
    );
  });
});
