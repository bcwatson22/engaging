'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Icon } from '@/components/atoms/Icon/Icon';

type Props = {
  labelledBy: string;
  controls: string;
  children: ReactNode;
};

const Reveal = ({ labelledBy, controls, children }: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false);
    };

    const onPointerDown = (event: PointerEvent): void => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <section
      ref={ref}
      aria-labelledby={labelledBy}
      className="overview"
      data-open={open || undefined}
    >
      <button
        type="button"
        className="mugshot-toggle"
        aria-expanded={open}
        aria-controls={controls}
        onClick={() => setOpen((previous) => !previous)}
      >
        <span className="sr-only">{open ? 'Hide' : 'Show'} about me</span>
        <span className="mugshot-hint" aria-hidden>
          <Icon icon="User" className="h-6 w-6 shrink-0" />
          About
        </span>
      </button>
      {children}
    </section>
  );
};

export { Reveal };
export type { Props as RevealProps };
