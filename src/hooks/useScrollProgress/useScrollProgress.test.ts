import { renderHook } from '@testing-library/react';
import { type MotionValue, useMotionValueEvent, useScroll } from 'motion/react';
import type { Mock } from 'vitest';

import { type Params, property, useScrollProgress } from './useScrollProgress';

vi.mock('motion/react', () => ({
  useScroll: vi.fn<typeof import('motion/react').useScroll>(),
  useMotionValueEvent:
    vi.fn<typeof import('motion/react').useMotionValueEvent>(),
}));

type SetupOptions = {
  target: HTMLElement | null;
};

const mockProgress = 'mockProgress' as unknown as MotionValue<number>;

const defaultParams: Omit<Params, 'ref'> = {
  offset: ['end end', 'start center'],
};

const setup = (
  options?: Partial<SetupOptions>,
  params?: Partial<Omit<Params, 'ref'>>,
) => {
  const setupOptions: SetupOptions = {
    target: document.createElement('div'),
    ...options,
  };

  (useScroll as Mock).mockReturnValue({ scrollYProgress: mockProgress });

  const ref = { current: setupOptions.target };

  renderHook(() => useScrollProgress({ ref, ...defaultParams, ...params }));

  const [[, , onChange]] = (useMotionValueEvent as Mock).mock.calls as [
    [unknown, unknown, (progress: number) => void],
  ];

  return { ref, onChange };
};

describe('useScrollProgress', () => {
  beforeEach(() => vi.clearAllMocks());

  it('tracks the target with the given offset', () => {
    const { ref } = setup();

    expect(useScroll).toHaveBeenNthCalledWith(1, {
      target: ref,
      offset: defaultParams.offset,
    });
  });

  it('listens for changes to the vertical progress', () => {
    setup();

    expect(useMotionValueEvent).toHaveBeenNthCalledWith(
      1,
      mockProgress,
      'change',
      expect.any(Function),
    );
  });

  it('writes each change to the custom property on the target', () => {
    const { ref, onChange } = setup();

    onChange(0.4);

    expect(ref.current?.style.getPropertyValue(property)).toBe('0.4');
  });

  it('ignores a change once the target has gone', () => {
    const { onChange } = setup({ target: null });

    expect(() => onChange(0.4)).not.toThrow();
  });
});
