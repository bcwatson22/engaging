import { cleanup, render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import type { Mock } from 'vitest';

import { download, home, Nav } from './Nav';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn<typeof import('next/navigation').usePathname>(),
}));

type Props = Parameters<typeof Nav>[0];

type SetupOptions = {
  pathname: string;
};

const setup = (options?: Partial<SetupOptions>, props?: Partial<Props>) => {
  const setupOptions: SetupOptions = {
    pathname: '/',
    ...options,
  };

  (usePathname as Mock).mockReturnValue(setupOptions.pathname);

  return render(<Nav {...props} />);
};

describe('Nav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('has no detectable WCAG A or AA violations', async () => {
    const { container } = setup();

    await expect(container).toHaveNoViolations();
  });

  it('always offers a way home', () => {
    setup();

    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('offers the CV by default', () => {
    setup();

    expect(screen.getByRole('link', { name: /^cv$/i })).toHaveAttribute(
      'href',
      '/cv',
    );
  });

  it('offers the contact page by default', () => {
    setup();

    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute(
      'href',
      '/contact',
    );
  });

  it('names itself for a screen reader', () => {
    setup();

    expect(
      screen.getByRole('navigation', { name: 'Site' }),
    ).toBeInTheDocument();
  });

  it('takes a name of its own', () => {
    setup({}, { label: 'Motes package' });

    expect(
      screen.getByRole('navigation', { name: 'Motes package' }),
    ).toBeInTheDocument();
  });

  it('offers whatever links it is given', () => {
    setup({}, { links: [home, download] });

    expect(screen.getByRole('link', { name: /download/i })).toHaveAttribute(
      'href',
      '/cv/download',
    );
  });

  it('offers nothing but the links it is given', () => {
    setup({}, { links: [home, download] });

    expect(
      screen.queryByRole('link', { name: /contact/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /^cv$/i }),
    ).not.toBeInTheDocument();
  });

  it('takes a className, so a page can place it', () => {
    setup({}, { className: 'flex justify-center' });

    expect(screen.getByRole('navigation')).toHaveClass(
      'flex',
      'justify-center',
    );
  });

  it('does not accumulate links across renders', () => {
    setup();
    cleanup();
    setup();

    expect(screen.getAllByRole('link')).toHaveLength(4);
  });

  it('does not accumulate links across renders, with its own links', () => {
    setup({}, { links: [home, download] });
    cleanup();
    setup({}, { links: [home, download] });

    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  describe('current page', () => {
    it('marks the link for the page being viewed', () => {
      setup({ pathname: '/contact' });

      expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });

    it('marks no other link', () => {
      setup({ pathname: '/contact' });

      expect(screen.getByRole('link', { name: /home/i })).not.toHaveAttribute(
        'aria-current',
      );
    });

    it('marks home only on the home page', () => {
      setup({ pathname: '/' });

      expect(
        screen
          .getAllByRole('link')
          .filter((link) => link.hasAttribute('aria-current')),
      ).toHaveLength(1);
    });

    it('marks a section from a page nested inside it', () => {
      setup({ pathname: '/motes/some-mote' });

      expect(screen.getByRole('link', { name: /motes/i })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });
  });

  it('styles the site nav as a pill track', () => {
    setup();

    expect(screen.getByRole('navigation')).toHaveClass('site-nav');
  });

  it('styles a nav of its own links like the details', () => {
    setup({}, { links: [home, download] });

    expect(screen.getByRole('navigation')).toHaveClass('nav');
  });
});
