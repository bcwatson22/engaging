import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Technologies, type TechnologiesProps } from './Technologies';

const defaultProps: TechnologiesProps = {
  children: <li>Mock technology</li>,
};

const setup = (props?: Partial<TechnologiesProps>) => {
  const user = userEvent.setup();
  const utils = render(<Technologies {...defaultProps} {...props} />);

  return { user, ...utils };
};

describe('Technologies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders a list of its children', () => {
    setup();

    expect(screen.getByRole('listitem')).toHaveTextContent('Mock technology');
  });

  it('is not dismissed to begin with', () => {
    setup();

    expect(screen.getByRole('list')).not.toHaveAttribute('data-dismissed');
  });

  it('dismisses the hover names on Escape', async () => {
    const { user } = setup();

    await user.hover(screen.getByRole('list'));
    await user.keyboard('{Escape}');

    expect(screen.getByRole('list')).toHaveAttribute('data-dismissed', 'true');
  });

  it('ignores other keys', async () => {
    const { user } = setup();

    await user.keyboard('{Shift}');

    expect(screen.getByRole('list')).not.toHaveAttribute('data-dismissed');
  });

  it('allows them again once the pointer leaves', async () => {
    const { user } = setup();

    await user.hover(screen.getByRole('list'));
    await user.keyboard('{Escape}');
    await user.unhover(screen.getByRole('list'));

    expect(screen.getByRole('list')).not.toHaveAttribute('data-dismissed');
  });

  it('stops listening when unmounted', () => {
    const spyRemove = vi.spyOn(document, 'removeEventListener');

    setup().unmount();

    expect(spyRemove).toHaveBeenNthCalledWith(
      1,
      'keydown',
      expect.any(Function),
    );
  });
});
