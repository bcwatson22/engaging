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

  describe('dismissing', () => {
    const regionOf = () => screen.getByRole('region', { name: 'Mock heading' });

    it('is not dismissed to begin with', () => {
      setup();

      expect(regionOf()).not.toHaveAttribute('data-dismissed');
    });

    it('dismisses the hover reveal on Escape', async () => {
      const { user } = setup();

      await user.hover(regionOf());
      await user.keyboard('{Escape}');

      expect(regionOf()).toHaveAttribute('data-dismissed', 'true');
    });

    it('allows it again once the pointer leaves', async () => {
      const { user } = setup();

      await user.hover(regionOf());
      await user.keyboard('{Escape}');
      await user.unhover(regionOf());

      expect(regionOf()).not.toHaveAttribute('data-dismissed');
    });

    it('allows it again once focus moves within it', async () => {
      const { user } = setup({
        children: (
          <div id="mock-info">
            <h2 id="mock-heading">Mock heading</h2>
            <a href="#first">First</a>
            <a href="#second">Second</a>
          </div>
        ),
      });

      await user.keyboard('{Escape}');
      await user.tab();

      expect(regionOf()).toHaveAttribute('data-dismissed', 'true');

      await user.tab();

      expect(regionOf()).not.toHaveAttribute('data-dismissed');
    });

    it('stays dismissed after handing focus back from the links', async () => {
      const { user } = setup({
        children: (
          <div id="mock-info">
            <h2 id="mock-heading">Mock heading</h2>
            <a href="#first">First</a>
          </div>
        ),
      });

      await user.hover(regionOf());
      await user.tab();
      await user.tab();
      await user.keyboard('{Escape}');

      expect(regionOf()).toHaveAttribute('data-dismissed', 'true');
    });

    it('hands focus from the links back to the toggle', async () => {
      const { user } = setup({
        children: (
          <div id="mock-info">
            <h2 id="mock-heading">Mock heading</h2>
            <a href="#first">First</a>
          </div>
        ),
      });

      await user.tab();
      await user.tab();

      expect(screen.getByRole('link', { name: 'First' })).toHaveFocus();

      await user.keyboard('{Escape}');

      expect(
        screen.getByRole('button', { name: /show about me/i }),
      ).toHaveFocus();
    });

    it('leaves focus alone when it is elsewhere', async () => {
      const { user } = setup();

      await user.keyboard('{Escape}');

      expect(document.body).toHaveFocus();
    });

    it('stops listening when unmounted', async () => {
      const spyRemove = vi.spyOn(document, 'removeEventListener');

      render(<Reveal {...defaultProps} />).unmount();

      expect(spyRemove).toHaveBeenNthCalledWith(
        1,
        'keydown',
        expect.any(Function),
      );
    });
  });
});
