import { cleanup, render, screen } from '@testing-library/react';

import { Nav } from './Nav';

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

  it('offers the download instead where there is one', () => {
    setup({ hasDownload: true });

    expect(screen.getByRole('link', { name: /download/i })).toHaveAttribute(
      'href',
      '/cv/download',
    );
  });

  /* On the CV page itself, where the download replaces both — linking to the
     page you are already on, and away from it, would both be noise. */
  it('offers only the download, not the pages it replaces', () => {
    setup({ hasDownload: true });

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

    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  /* The download variant is the one that broke: a single object spread into
     an array literal throws, because an object has no iterator. It only ever
     ran on the CV page, so the default path stayed working. */
  it('does not accumulate links across renders, with a download', () => {
    setup({ hasDownload: true });
    cleanup();
    setup({ hasDownload: true });

    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
