import { cleanup, render, screen } from '@testing-library/react';

import { title } from '@/app/(site)/status/page';

import LoadingStatus from './loading';

const setup = () => render(<LoadingStatus />);

describe('LoadingStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders a main', () => {
    setup();

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  /* The same heading the page renders. A fallback that named the page
     differently would announce one title and then another. */
  it('renders the heading the page will render', () => {
    setup();

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  });

  /* The reason this file exists: the group's loading UI mirrors the home page,
     and without a nearer one the status route would fall back to it. */
  it('does not fall back to the home page shell', () => {
    setup();

    expect(
      screen.queryByRole('heading', { name: 'Engaging Engineering' }),
    ).not.toBeInTheDocument();
  });
});
