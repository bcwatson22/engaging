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

  /* Both are landmarks only when they sit outside main — nesting either inside
     it disqualifies them, which is what was happening while each page rendered
     its own footer. */
  it('offers a banner and a contentinfo landmark', () => {
    setup();

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('keeps them both out of main', () => {
    const { container } = setup({ children: <main>Contact</main> });

    expect(container.querySelector('main nav')).toBeNull();
    expect(container.querySelector('main footer')).toBeNull();
  });
});
