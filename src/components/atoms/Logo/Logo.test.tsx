import { cleanup, render, screen, within } from '@testing-library/react';

import { mockCV } from '@/data/mock/cv';

import { Logo, type TLogo, alt } from './Logo';

const { logoLightBackground, logoDarkBackground } = mockCV;

const defaultProps: TLogo = {
  logoLightBackground,
  logoDarkBackground,
};

const setup = (props?: Partial<TLogo>) =>
  render(<Logo {...defaultProps} {...props} />);

describe('Logo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders an image for screen', () => {
    setup();

    expect(screen.getByRole('img', { name: alt })).toHaveAttribute(
      'src',
      expect.stringContaining(encodeURIComponent(logoLightBackground.url)),
    );
  });

  it('renders an image for print', () => {
    setup();

    const figure = screen.getByRole('figure');

    expect(figure).toHaveAttribute(
      'style',
      expect.stringContaining(logoLightBackground.url),
    );

    /* The name comes from the figcaption. Real screen readers derive it per
       HTML-AAM, but dom-accessibility-api does not compute it, so assert the
       caption directly rather than via the accessible name. */
    expect(within(figure).getByText(alt)).toBeInTheDocument();
  });
});
