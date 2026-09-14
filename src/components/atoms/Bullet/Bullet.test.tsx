import { render, screen, within } from '@testing-library/react';

import { Bullet, BulletSkeleton, type BulletProps } from './Bullet';

const mockChildren = 'mock-children';

const defaultProps: BulletProps = {
  children: <button>{mockChildren}</button>,
};

const setup = (props?: Partial<BulletProps>) =>
  render(<Bullet {...defaultProps} {...props} />);

describe('Bullet', () => {
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
