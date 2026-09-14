import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';

import { useMotionPreference } from '@/hooks/useMotionPreference/useMotionPreference';

import { labels, Toggle, type ToggleProps } from './Toggle';

vi.mock('@/hooks/useMotionPreference/useMotionPreference', () => ({
  useMotionPreference:
    vi.fn<
      typeof import('@/hooks/useMotionPreference/useMotionPreference').useMotionPreference
    >(),
}));

type SetupOptions = {
  isPaused: boolean;
};

const mockToggle = vi.fn<() => void>();

const setup = (
  options?: Partial<SetupOptions>,
  props?: Partial<ToggleProps>,
) => {
  const { isPaused }: SetupOptions = { isPaused: false, ...options };

  (useMotionPreference as Mock).mockReturnValue({
    isPaused,
    toggle: mockToggle,
  });

  return render(<Toggle {...props} />);
};

describe('Toggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders a button', () => {
    setup();

    expect(
      screen.getByRole('button', { name: labels.running }),
    ).toBeInTheDocument();
  });

  it('is styled as an icon link', () => {
    setup();

    expect(screen.getByRole('button', { name: labels.running })).toHaveClass(
      'link',
      'icon',
    );
  });

  it('does not also carry a pressed state', () => {
    setup({ isPaused: true });

    expect(
      screen.getByRole('button', { name: labels.paused }),
    ).not.toHaveAttribute('aria-pressed');
  });

  it('carries both labels so it can reserve the width of the longer', () => {
    setup({ isPaused: true });

    const button = screen.getByRole('button', { name: labels.paused });

    expect(button).toHaveAttribute('data-running', labels.running);
    expect(button).toHaveAttribute('data-paused', labels.paused);
  });

  describe('while motion runs', () => {
    it('offers to pause it', () => {
      setup();

      expect(
        screen.getByRole('button', { name: labels.running }),
      ).toBeInTheDocument();
    });

    it('shows a pause icon', () => {
      const { container } = setup();

      expect(
        container.querySelector('[aria-label="Pause"]'),
      ).toBeInTheDocument();
    });
  });

  describe('while motion is paused', () => {
    it('offers to play it', () => {
      setup({ isPaused: true });

      expect(
        screen.getByRole('button', { name: labels.paused }),
      ).toBeInTheDocument();
    });

    it('shows a play icon', () => {
      const { container } = setup({ isPaused: true });

      expect(
        container.querySelector('[aria-label="Play"]'),
      ).toBeInTheDocument();
    });
  });

  it('toggles the preference when pressed', async () => {
    setup();

    await userEvent.click(screen.getByRole('button', { name: labels.running }));

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  describe('className', () => {
    it('is added when provided', () => {
      setup({}, { className: 'mockClassName' });

      expect(screen.getByRole('button', { name: labels.running })).toHaveClass(
        'mockClassName',
      );
    });
  });
});
