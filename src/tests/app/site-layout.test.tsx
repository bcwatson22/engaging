import { render, screen } from '@testing-library/react';

import SiteLayout, { type SiteLayoutProps } from '@/app/(site)/layout';

const setup = (props?: Partial<SiteLayoutProps>) =>
  render(<SiteLayout {...props}>{props?.children ?? <main />}</SiteLayout>);

describe('SiteLayout', () => {
  /* The reason the group exists: one nav for every page that should have one,
     rather than each page remembering to render it. */
  it('offers a way around the site', () => {
    setup();

    expect(
      screen.getByRole('navigation', { name: 'Site' }),
    ).toBeInTheDocument();
  });

  it('renders the page inside it', () => {
    setup({ children: <main>Contact</main> });

    expect(screen.getByRole('main')).toHaveTextContent('Contact');
  });

  /* Outside main, which is where a nav repeated on every page belongs — main
     is for what is unique to the page. */
  it('keeps the nav out of main', () => {
    const { container } = setup({ children: <main>Contact</main> });

    expect(container.querySelector('main nav')).toBeNull();
  });
});
