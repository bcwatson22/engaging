import { cleanup, render, screen } from '@testing-library/react';

import { Copyright } from './Copyright';

const setup = () => render(<Copyright />);

describe('Copyright', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders copyright text', () => {
    setup();

    expect(screen.getByText(/©/i)).toBeInTheDocument();
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });
});
