import { act, cleanup, render, waitFor } from '@testing-library/react';

import { Particles } from './Particles';
import { ParticlesCanvas } from './ParticlesCanvas';

vi.mock('./ParticlesCanvas', () => ({
  ParticlesCanvas: vi.fn<typeof import('./ParticlesCanvas').ParticlesCanvas>(
    () => <></>,
  ),
}));

type IdleCallback = Parameters<typeof window.requestIdleCallback>[0];

type Options = {
  supportsIdleCallback?: boolean;
  isIdle?: boolean;
};

const colors = { color: '#245385', colorDark: '#f9fafb' };

const setup = ({
  supportsIdleCallback = true,
  isIdle = true,
}: Options = {}) => {
  if (supportsIdleCallback) {
    vi.stubGlobal(
      'requestIdleCallback',
      vi.fn((callback: IdleCallback) => {
        if (isIdle) {
          callback({ didTimeout: false, timeRemaining: () => 0 });
        }

        return 1;
      }),
    );
    vi.stubGlobal('cancelIdleCallback', vi.fn());
  } else {
    vi.stubGlobal('requestIdleCallback', undefined);
  }

  return render(<Particles {...colors} />);
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

  it("doesn't render the canvas before the browser is idle", async () => {
    setup({ isIdle: false });

    /* Flush what a successful render would resolve — the gate never mounts
       the lazy component, so without this the assertion passes merely because
       the dynamic import hasn't settled yet, and holds even if the gate goes. */
    await act(async () => {});

    expect(ParticlesCanvas).not.toHaveBeenCalled();
  });

  it('renders the canvas once the browser is idle', async () => {
    setup();

    await waitFor(() => expect(ParticlesCanvas).toHaveBeenCalledTimes(1));
  });

  it('falls back to a timeout without requestIdleCallback', async () => {
    setup({ supportsIdleCallback: false });

    await waitFor(() => expect(ParticlesCanvas).toHaveBeenCalledTimes(1));
  });

  /* The gate decides when the field appears; the canvas decides what it looks
     like. Swallowing the colours here would leave a page unable to say. */
  it('forwards its colours to the canvas', async () => {
    setup();

    await waitFor(() => expect(ParticlesCanvas).toHaveBeenCalled());

    /* The props themselves, not the whole call: React hands a second argument
       through the dynamic wrapper that is an implementation detail. */
    expect(vi.mocked(ParticlesCanvas).mock.calls[0][0]).toEqual(colors);
  });
});
