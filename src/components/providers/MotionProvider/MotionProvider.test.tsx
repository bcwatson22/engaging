import { cleanup, render, screen, waitFor } from '@testing-library/react';

import { MotionProvider } from './MotionProvider';

describe('MotionProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders its children', async () => {
    render(
      <MotionProvider>
        <p>mockChild</p>
      </MotionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('mockChild')).toBeInTheDocument();
    });
  });
});
