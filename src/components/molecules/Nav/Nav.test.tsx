import { cleanup, render, screen } from '@testing-library/react';

import { download, home, Nav } from './Nav';

type Props = Parameters<typeof Nav>[0];

const setup = (props?: Partial<Props>) => render(<Nav {...props} />);

describe('Nav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
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

  /* Two navs on a page are announced identically without this, so neither
     says which one it is. */
  it('names itself for a screen reader', () => {
    setup();

    expect(
      screen.getByRole('navigation', { name: 'Site' }),
    ).toBeInTheDocument();
  });

  it('takes a name of its own', () => {
    setup({ label: 'Motes package' });

    expect(
      screen.getByRole('navigation', { name: 'Motes package' }),
    ).toBeInTheDocument();
  });

  it('offers whatever links it is given', () => {
    setup({ links: [home, download] });

    expect(screen.getByRole('link', { name: /download/i })).toHaveAttribute(
      'href',
      '/cv/download',
    );
  });

  /* The point of the prop: a page that passes its own gets only those. On the
     CV, linking to the page you are already on would be noise. */
  it('offers nothing but the links it is given', () => {
    setup({ links: [home, download] });

    expect(
      screen.queryByRole('link', { name: /contact/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /^cv$/i }),
    ).not.toBeInTheDocument();
  });

  it('takes a className, so a page can place it', () => {
    setup({ className: 'flex justify-center' });

    expect(screen.getByRole('navigation')).toHaveClass(
      'flex',
      'justify-center',
    );
  });

  /* The regression this file was written for. The links used to be a
     module-level array that the component pushed onto, so it grew by an entry
     every render — twice on mount under Strict Mode, and again on every
     navigation — leaving the nav with repeated links and duplicate keys.
     Rendering twice is what makes that visible; a single render passed. */
  it('does not accumulate links across renders', () => {
    setup();
    cleanup();
    setup();

    expect(screen.getAllByRole('link')).toHaveLength(4);
  });

  /* The variant that broke: a single object spread into an array literal
     throws, because an object has no iterator. It only ever ran on the CV
     page, so the default path stayed working. */
  it('does not accumulate links across renders, with its own links', () => {
    setup({ links: [home, download] });
    cleanup();
    setup({ links: [home, download] });

    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
