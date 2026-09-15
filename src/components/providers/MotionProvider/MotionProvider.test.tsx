import { cleanup, render, screen, waitFor } from '@testing-library/react';
import {
  domAnimation,
  LazyMotion,
  type FeatureBundle,
  type LazyProps,
} from 'motion/react';
import { useEffect } from 'react';

import { MotionProvider } from './MotionProvider';

vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  LazyMotion: vi.fn<typeof import('motion/react').LazyMotion>(),
}));

const setup = () => {
  const onLoad = vi.fn<(features: FeatureBundle) => void>();

  vi.mocked(LazyMotion).mockImplementation(
    ({ children, features }: LazyProps) => {
      useEffect(() => {
        if (typeof features === 'function') void features().then(onLoad);
      }, [features]);

      return <>{children}</>;
    },
  );

  return {
    onLoad,
    ...render(
      <MotionProvider>
        <p>mockChild</p>
      </MotionProvider>,
    ),
  };
};

describe('MotionProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders its children', () => {
    setup();

    expect(screen.getByText('mockChild')).toBeInTheDocument();
  });

  it('loads the DOM animation features once mounted', async () => {
    const { onLoad } = setup();

    await waitFor(() =>
      expect(onLoad).toHaveBeenNthCalledWith(1, domAnimation),
    );
  });
});
