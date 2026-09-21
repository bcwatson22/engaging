'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';

import { Icon } from '@/components/atoms/Icon/Icon';

type Props = {
  labelledBy: string;
  controls: string;
  children: ReactNode;
};

const Reveal = ({ labelledBy, controls, children }: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const ref = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;

      setOpen(false);
      setDismissed(true);

      if (ref.current?.contains(document.activeElement))
        buttonRef.current?.focus();
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = ({ target }: PointerEvent): void => {
      const element = target as Element;
      const isOnPortrait = buttonRef.current?.contains(element);
      const isOnInfoLink =
        ref.current?.contains(element) && element.closest('a') !== null;

      if (!isOnPortrait && !isOnInfoLink) setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);

    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    const section = ref.current!;

    const undismiss = (): void => setDismissed(false);

    const onFocusIn = ({ target }: FocusEvent): void => {
      if (target !== buttonRef.current) undismiss();
    };

    section.addEventListener('pointerleave', undismiss);
    section.addEventListener('focusin', onFocusIn);

    return () => {
      section.removeEventListener('pointerleave', undismiss);
      section.removeEventListener('focusin', onFocusIn);
    };
  }, []);

  return (
    <section
      ref={ref}
      aria-labelledby={labelledBy}
      className="overview"
      data-open={open || undefined}
      data-dismissed={dismissed || undefined}
    >
      <button
        ref={buttonRef}
        type="button"
        className="mugshot-toggle"
        aria-expanded={open}
        aria-controls={controls}
        onClick={() => setOpen((previous) => !previous)}
      >
        <span className="sr-only">{open ? 'Hide' : 'Show'} about me</span>
        <span className="mugshot-hint" aria-hidden>
          <Icon icon="User" className="h-6 w-6 shrink-0" />
          <span>About</span>
        </span>
      </button>
      {children}
    </section>
  );
};

export { Reveal };
export type { Props as RevealProps };
