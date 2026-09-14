import { cleanup, render, screen, within } from '@testing-library/react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import Layout, { type LayoutProps } from './layout';

vi.mock(import('next/font/google'), async (importOriginal: Function) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Nunito: vi
      .fn<typeof import('next/font/google').Nunito>()
      .mockReturnValue({ className: 'mockClassName' } as ReturnType<
        typeof import('next/font/google').Nunito
      >),
  };
});

vi.mock(import('@vercel/analytics/next'), async (importOriginal: Function) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Analytics: vi.fn<typeof import('@vercel/analytics/next').Analytics>(),
  };
});

vi.mock(
  import('@vercel/speed-insights/next'),
  async (importOriginal: Function) => {
    const actual = await importOriginal();
    return {
      ...actual,
      SpeedInsights:
        vi.fn<typeof import('@vercel/speed-insights/next').SpeedInsights>(),
    };
  },
);

const mockText = 'mockText';
const mockChildren = <button>{mockText}</button>;

const defaultProps: LayoutProps = {
  children: mockChildren,
};

const setup = (props?: Partial<LayoutProps>) =>
  render(<Layout {...defaultProps} {...props} />);

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders a document', () => {
    setup();

    expect(document.documentElement).toHaveAttribute('lang', 'en-GB');
    expect(document.body).toHaveClass('mockClassName');
  });

  it('offers a way past the navigation', () => {
    setup();

    expect(
      screen.getByRole('link', { name: 'Skip to content' }),
    ).toHaveAttribute('href', '#main');
  });

  it('renders children', () => {
    setup();

    expect(screen.getByRole('button', { name: mockText })).toBeInTheDocument();
  });

  it('renders an Analytics component', () => {
    setup();

    expect(Analytics).toHaveBeenCalledTimes(1);
  });

  it('renders a SpeedInsights component', () => {
    setup();

    expect(SpeedInsights).toHaveBeenCalledTimes(1);
  });

  it('offers a way around the site', () => {
    setup();

    expect(
      screen.getByRole('navigation', { name: 'Site' }),
    ).toBeInTheDocument();
  });

  it('offers a banner and a contentinfo landmark', () => {
    setup();

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('offers a way to pause motion in the footer', () => {
    setup();

    expect(
      within(screen.getByRole('contentinfo')).getByRole('button', {
        name: 'Pause motion',
      }),
    ).toBeInTheDocument();
  });

  it('keeps them both out of main', () => {
    const { container } = setup({ children: <main>Contact</main> });

    expect(container.querySelector('main nav')).toBeNull();
    expect(container.querySelector('main footer')).toBeNull();
  });
});
