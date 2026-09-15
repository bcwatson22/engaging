import { render, screen, within } from '@testing-library/react';

import SiteLayout, { type SiteLayoutProps } from './layout';

const setup = (props?: Partial<SiteLayoutProps>) =>
  render(<SiteLayout {...props}>{props?.children ?? <main />}</SiteLayout>);

describe('SiteLayout', () => {
  it('has no detectable WCAG A or AA violations', async () => {
    const { container } = setup();

    await expect(container).toHaveNoViolations();
  });
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
