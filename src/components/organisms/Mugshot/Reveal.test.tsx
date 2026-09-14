import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Reveal, type RevealProps } from './Reveal';

const defaultProps: RevealProps = {
  labelledBy: 'mock-heading',
  controls: 'mock-info',
  children: (
    <div id="mock-info">
      <h2 id="mock-heading">Mock heading</h2>
    </div>
  ),
};

const setup = (props?: Partial<RevealProps>) => {
  const user = userEvent.setup();

  render(
    <>
      <Reveal {...defaultProps} {...props} />
      <p>Elsewhere</p>
    </>,
  );

  return { user };
};

describe('Reveal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders a region named by its heading', () => {
    setup();

    expect(
      screen.getByRole('region', { name: 'Mock heading' }),
    ).toBeInTheDocument();
  });

  it('renders its children', () => {
    setup();

    expect(
      screen.getByRole('heading', { level: 2, name: 'Mock heading' }),
    ).toBeInTheDocument();
  });

  describe('toggle', () => {
    it('starts closed', () => {
      setup();

      expect(
        screen.getByRole('button', { name: /show about me/i }),
      ).toHaveAttribute('aria-expanded', 'false');
    });

    it('controls the info', () => {
      setup();

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-controls',
        'mock-info',
      );
    });

    it('opens when pressed', async () => {
      const { user } = setup();

      await user.click(screen.getByRole('button', { name: /show about me/i }));

      expect(
        screen.getByRole('button', { name: /hide about me/i }),
      ).toHaveAttribute('aria-expanded', 'true');
    });

    it('closes when pressed again', async () => {
      const { user } = setup();

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('button'));

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    it('closes on Escape', async () => {
      const { user } = setup();

      await user.click(screen.getByRole('button'));
      await user.keyboard('{Escape}');

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    it('stays open on any other key', async () => {
      const { user } = setup();

      await user.click(screen.getByRole('button'));
      await user.keyboard('{Shift}');

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });

    it('closes on a tap outside', async () => {
      const { user } = setup();

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('Elsewhere'));

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    it('stays open on a tap inside', async () => {
      const { user } = setup();

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('heading', { level: 2 }));

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });
  });
});
