import { cleanup, render, screen } from '@testing-library/react';

import { title } from '@/app/status/page';

import LoadingStatus from './loading';

const setup = () => render(<LoadingStatus />);

describe('LoadingStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders a main', () => {
    setup();

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
  });

  it('renders the heading the page will render', () => {
    setup();

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  });

  it('does not fall back to the home page shell', () => {
    setup();

    expect(
      screen.queryByRole('heading', { name: 'Engaging Engineering' }),
    ).not.toBeInTheDocument();
  });

  it('announces that it is loading', () => {
    setup();

    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
  });
});
