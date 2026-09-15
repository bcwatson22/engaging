import { cleanup, render, screen } from '@testing-library/react';

import { Transition, type TransitionProps } from './Transition';

const defaultProps: TransitionProps = {
  children: <main>mockPage</main>,
};

const setup = (props?: Partial<TransitionProps>) =>
  render(<Transition {...defaultProps} {...props} />);

describe('Transition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders the page inside it', () => {
    setup();

    expect(screen.getByRole('main')).toHaveTextContent('mockPage');
  });
});
