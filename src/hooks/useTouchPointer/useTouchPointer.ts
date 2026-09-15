import { useEffect } from 'react';

/* The particle field follows the pointer through window pointermove, which a
   mouse fires simply by being over the page. A finger does not: a tap with no
   drag fires no pointermove at all, so the field only ever saw the first touch
   that happened to move and ignored every tap after it. Each touch or pen press
   is replayed as a pointermove at the same point, so every tap moves the
   field's focus to where it landed. */
const useTouchPointer = (): void => {
  useEffect(() => {
    const onPointerDown = (event: PointerEvent): void => {
      if (event.pointerType === 'mouse') return;

      window.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: event.clientX,
          clientY: event.clientY,
          pointerType: event.pointerType,
        }),
      );
    };

    window.addEventListener('pointerdown', onPointerDown);

    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, []);
};

export { useTouchPointer };
