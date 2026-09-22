import { cleanup, render, screen } from '@testing-library/react';
import type { Target } from 'motion/react';
import type { Mock } from 'vitest';

import { useScrollProgress } from '@/hooks/useScrollProgress/useScrollProgress';
import { useScrollTrigger } from '@/hooks/useScrollTrigger/useScrollTrigger';

import { Divider, type DividerProps } from './Divider';

vi.mock('@/hooks/useScrollTrigger/useScrollTrigger', () => ({
  useScrollTrigger:
    vi.fn<
      typeof import('@/hooks/useScrollTrigger/useScrollTrigger').useScrollTrigger
    >(),
}));

vi.mock('@/hooks/useScrollProgress/useScrollProgress', () => ({
  useScrollProgress:
    vi.fn<
      typeof import('@/hooks/useScrollProgress/useScrollProgress').useScrollProgress
    >(),
}));

type UseScrollTrigger = Partial<ReturnType<typeof useScrollTrigger>>;

type SetupOptions = {
  useScrollTrigger: UseScrollTrigger;
};

const defaultScrollTrigger: UseScrollTrigger = {
  initial: { opacity: 0, y: '10px' },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0 },
};

const mockHeading = 'mockHeading';

const defaultProps: DividerProps = {
  heading: mockHeading,
};

const setup = (
  options?: Partial<SetupOptions>,
  props?: Partial<DividerProps>,
) => {
  const setupOptions: SetupOptions = {
    useScrollTrigger: defaultScrollTrigger,
    ...options,
  };

  (useScrollTrigger as Mock).mockReturnValue(setupOptions.useScrollTrigger);

  render(<Divider {...defaultProps} {...props} />);
};

describe('Divider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe('heading', () => {
    it('renders a heading', () => {
      setup();

      expect(
        screen.getByRole('heading', {
          level: 2,
          name: new RegExp(mockHeading, 'i'),
        }),
      ).toBeInTheDocument();
    });

    it('is named by the heading alone', () => {
      setup();

      expect(
        screen.getByRole('heading', { level: 2, name: `${mockHeading}:` }),
      ).toBeInTheDocument();
    });

    it('uses the initial values returned from useScrollTrigger for the heading style', () => {
      setup();

      const { opacity, y } = defaultScrollTrigger.initial as Target;

      expect(screen.getByRole('heading')).toHaveStyle({
        opacity,
        transform: `translateY(${y})`,
      });
    });
  });

  describe('underline', () => {
    it('draws across as the heading rises to the middle of the viewport', () => {
      setup();

      expect(useScrollProgress).toHaveBeenNthCalledWith(1, {
        ref: expect.objectContaining({
          current: screen.getByRole('heading').parentElement,
        }),
        offset: ['end end', 'start center'],
      });
    });
  });

  describe('scroll trigger', () => {
    it('defaults to no delay', () => {
      setup();

      expect(useScrollTrigger).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ delay: 0 }),
      );
    });

    it('passes its options to useScrollTrigger', () => {
      const mockMargin = '5px';

      setup(undefined, {
        delay: 2,
        margin: mockMargin,
        amount: 'some',
        isImmediate: true,
      });

      expect(useScrollTrigger).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          delay: 2,
          margin: mockMargin,
          amount: 'some',
          isImmediate: true,
        }),
      );
    });
  });
});
