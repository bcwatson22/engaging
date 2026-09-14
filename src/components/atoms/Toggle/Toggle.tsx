'use client';

import { Inner } from '@/components/atoms/Link/Link';
import { useMotionPreference } from '@/hooks/useMotionPreference/useMotionPreference';

type Props = {
  className?: string;
};

const labels = {
  running: 'Pause motion',
  paused: 'Play motion',
} as const;

const Toggle = ({ className }: Props) => {
  const { isPaused, toggle } = useMotionPreference();

  return (
    <button
      type="button"
      className={['link icon toggle', className].filter(Boolean).join(' ')}
      data-running={labels.running}
      data-paused={labels.paused}
      onClick={toggle}
    >
      <Inner
        text={isPaused ? labels.paused : labels.running}
        icon={isPaused ? 'Play' : 'Pause'}
      />
    </button>
  );
};

export { Toggle, labels };
export type { Props as ToggleProps };
