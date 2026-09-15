import { renderHook } from '@testing-library/react';

import { useTouchPointer } from './useTouchPointer';

type SetupOptions = {
  pointerType?: string;
};

const setup = ({ pointerType = 'touch' }: SetupOptions = {}) => {
  const onPointerMove = vi.fn<(event: PointerEvent) => void>();

  window.addEventListener('pointermove', onPointerMove);

  const hook = renderHook(() => useTouchPointer());

  const press = (): void => {
    window.dispatchEvent(
      new PointerEvent('pointerdown', {
        clientX: 120,
        clientY: 80,
        pointerType,
      }),
    );
  };

  const teardown = (): void => {
    hook.unmount();
    window.removeEventListener('pointermove', onPointerMove);
  };

  return { onPointerMove, press, teardown, ...hook };
};

describe('useTouchPointer', () => {
  it('replays a touch press as a pointermove where it landed', () => {
    const { onPointerMove, press, teardown } = setup();

    press();

    expect(onPointerMove).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ clientX: 120, clientY: 80 }),
    );

    teardown();
  });

  it('replays a pen press too', () => {
    const { onPointerMove, press, teardown } = setup({ pointerType: 'pen' });

    press();

    expect(onPointerMove).toHaveBeenCalledTimes(1);

    teardown();
  });

  it('leaves a mouse alone, which moves on its own', () => {
    const { onPointerMove, press, teardown } = setup({ pointerType: 'mouse' });

    press();

    expect(onPointerMove).toHaveBeenCalledTimes(0);

    teardown();
  });

  it('stops listening once unmounted', () => {
    const { onPointerMove, press, teardown } = setup();

    teardown();
    window.addEventListener('pointermove', onPointerMove);
    press();

    expect(onPointerMove).toHaveBeenCalledTimes(0);

    window.removeEventListener('pointermove', onPointerMove);
  });
});
