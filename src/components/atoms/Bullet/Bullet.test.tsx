import { render, screen, within } from '@testing-library/react';

import { useScrollProgress } from '@/hooks/useScrollProgress/useScrollProgress';

import { Bullet, BulletSkeleton, type BulletProps } from './Bullet';

vi.mock('@/hooks/useScrollProgress/useScrollProgress', () => ({
  useScrollProgress:
    vi.fn<
      typeof import('@/hooks/useScrollProgress/useScrollProgress').useScrollProgress
    >(),
}));

const mockChildren = 'mock-children';

const defaultProps: BulletProps = {
  children: <button>{mockChildren}</button>,
};

const setup = (props?: Partial<BulletProps>) =>
  render(<Bullet {...defaultProps} {...props} />);

describe('Bullet', () => {
  beforeEach(() => vi.clearAllMocks());

  it('scales its dot in as it rises into the bottom fifth of the viewport', () => {
    setup();

    expect(useScrollProgress).toHaveBeenNthCalledWith(1, {
      ref: expect.objectContaining({ current: screen.getByRole('listitem') }),
      offset: ['end end', 'start 80vh'],
    });
  });

  it('renders a listitem', () => {
    setup();

    expect(
      within(screen.getByRole('listitem')).getByRole('button', {
        name: mockChildren,
      }),
    ).toBeInTheDocument();
  });

  it('reads as its content alone', () => {
    setup({ children: 'Shipped a thing' });

    expect(screen.getByText('Bullet')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('BulletSkeleton', () => {
  it('hides its dot from assistive technology', () => {
    const { container } = render(<BulletSkeleton index={0} />);

    expect(container.querySelector('.bullet span')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});
