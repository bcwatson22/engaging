import { cleanup, render, screen } from '@testing-library/react';

import { Intro } from '@/components/atoms/Intro/Intro';
import { Logo } from '@/components/atoms/Logo/Logo';
import { mockCV } from '@/data/mock/cv';

import { Header, HeaderSkeleton, type HeaderProps } from './Header';

vi.mock('@/components/atoms/Intro/Intro', () => ({
  Intro: vi.fn<typeof import('@/components/atoms/Intro/Intro').Intro>(),
}));

vi.mock('@/components/atoms/Logo/Logo', () => ({
  Logo: vi.fn<typeof import('@/components/atoms/Logo/Logo').Logo>(),
}));

const {
  meta: { title },
  logoDarkBackground,
  logoLightBackground,
  intro,
} = mockCV;

const defaultProps: HeaderProps = {
  title,
  logoDarkBackground,
  logoLightBackground,
  intro,
};

const setup = (props?: Partial<HeaderProps>) =>
  render(<Header {...defaultProps} {...props} />);

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe('title', () => {
    it('renders a heading', () => {
      setup();

      expect(
        screen.getByRole('heading', { level: 1, name: title }),
      ).toBeInTheDocument();
    });
  });

  describe('nav', () => {
    it('names itself for the CV', () => {
      setup();

      expect(
        screen.getByRole('navigation', { name: 'CV' }),
      ).toBeInTheDocument();
    });

    it('offers the PDF', () => {
      setup();

      expect(
        screen.getByRole('link', { name: /^PDF ?\(opens in new tab\)$/ }),
      ).toHaveAttribute('href', '/billy-watson-cv.pdf');
    });

    it('opens the PDF in a new tab', () => {
      setup();

      expect(
        screen.getByRole('link', { name: /^PDF ?\(opens in new tab\)$/ }),
      ).toHaveAttribute('target', '_blank');
    });

    it('offers a download', () => {
      setup();

      expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute(
        'href',
        '/cv/download',
      );
    });

    it('leaves home to the site nav', () => {
      setup();

      expect(
        screen.queryByRole('link', { name: 'Home' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('logoDarkBackground // logoLightBackground', () => {
    it('renders a Logo', () => {
      setup();

      expect(Logo).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ logoDarkBackground, logoLightBackground }),
        undefined,
      );
    });
  });

  describe('intro', () => {
    it('renders an Intro', () => {
      setup();

      expect(Intro).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ intro }),
        undefined,
      );
    });
  });
});

describe('HeaderSkeleton', () => {
  it('renders a skeleton state', () => {
    const { container } = render(<HeaderSkeleton />);

    const numOfPulses = 9;

    expect(
      container.querySelectorAll('.skeleton[aria-hidden="true"]'),
    ).toHaveLength(numOfPulses);
  });

  it('renders the CV nav, so the page does not shift when it arrives', () => {
    render(<HeaderSkeleton />);

    expect(screen.getByRole('navigation', { name: 'CV' })).toBeInTheDocument();
  });
});
