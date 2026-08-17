import { cleanup, render, screen, waitFor } from '@testing-library/react';

import { Particles } from './Particles';

vi.mock('./ParticlesCanvas', () => ({
  ParticlesCanvas: vi.fn<typeof import('./ParticlesCanvas').ParticlesCanvas>(
    () => <div>Test particles</div>,
  ),
}));

type IdleCallback = Parameters<typeof window.requestIdleCallback>[0];

type Options = {
  supportsIdleCallback?: boolean;
};

const setup = ({ supportsIdleCallback = true }: Options = {}) => {
  if (supportsIdleCallback) {
    vi.stubGlobal(
      'requestIdleCallback',
      vi.fn((callback: IdleCallback) => {
        callback({ didTimeout: false, timeRemaining: () => 0 });

        return 1;
      }),
    );
    vi.stubGlobal('cancelIdleCallback', vi.fn());
  } else {
    vi.stubGlobal('requestIdleCallback', undefined);
  }

  return render(<Particles />);
};

describe('Particles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* Unmount before the stubs go, or React runs the effect's teardown against
     a window that no longer has cancelIdleCallback on it. */
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("doesn't render the canvas before the browser is idle", () => {
    vi.stubGlobal(
      'requestIdleCallback',
      vi.fn(() => 1),
    );
    vi.stubGlobal('cancelIdleCallback', vi.fn());

    render(<Particles />);

    expect(screen.queryByText('Test particles')).not.toBeInTheDocument();
  });

  it('renders the canvas once the browser is idle', async () => {
    setup();

    await waitFor(() =>
      expect(screen.getByText('Test particles')).toBeInTheDocument(),
    );
  });

  it('falls back to a timeout without requestIdleCallback', async () => {
    setup({ supportsIdleCallback: false });

    await waitFor(() =>
      expect(screen.getByText('Test particles')).toBeInTheDocument(),
    );
  });
});
