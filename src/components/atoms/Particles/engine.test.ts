import type { Mock } from 'vitest';

import { createField, options, source } from './engine';

/* A stand-in for the compiled module. The simulation itself is tested in Rust
   with cargo; what matters here is that this half drives it correctly and
   draws what it reports. */
const stride = 5;

type WasmOptions = {
  count?: number;
  /* Bubble progress per particle, 0 at rest and 1 fully bubbled. */
  bubbles?: number[];
};

const createWasm = ({ count = 2, bubbles = [] }: WasmOptions = {}) => {
  const buffer = new ArrayBuffer(count * stride * 4);
  const view = new Float32Array(buffer);

  for (let i = 0; i < count; i++) {
    view[i * stride] = 10 + i;
    view[i * stride + 1] = 20 + i;
    view[i * stride + 4] = bubbles[i] ?? 0;
  }

  return {
    memory: { buffer } as WebAssembly.Memory,
    configure: vi.fn<() => void>(),
    resize: vi.fn<() => void>(),
    tick: vi.fn<() => void>(),
    data_ptr: vi.fn<() => number>(() => 0),
    count: vi.fn<() => number>(() => count),
    stride: vi.fn<() => number>(() => stride),
  };
};

const createContext = () => ({
  clearRect: vi.fn<() => void>(),
  setTransform: vi.fn<() => void>(),
  beginPath: vi.fn<() => void>(),
  arc: vi.fn<() => void>(),
  fill: vi.fn<() => void>(),
  fillStyle: '',
  globalAlpha: 1,
});

type Options = {
  wasm?: ReturnType<typeof createWasm>;
  context?: ReturnType<typeof createContext> | null;
  ratio?: number;
  clientWidth?: number;
  clientHeight?: number;
};

const setup = async ({
  wasm = createWasm(),
  context = createContext(),
  ratio = 1,
  clientWidth = 1280,
  clientHeight = 800,
}: Options = {}) => {
  vi.stubGlobal('devicePixelRatio', ratio);
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve({ arrayBuffer: () => Promise.resolve(null) })),
  );
  /* Cast through Mock: `instantiate` is overloaded, and TypeScript resolves
     the spy to the Module signature — which resolves to an Instance rather
     than the { instance } this one returns. */
  (vi.spyOn(WebAssembly, 'instantiate') as unknown as Mock).mockResolvedValue({
    instance: { exports: wasm },
  });

  const canvas = document.createElement('canvas');

  Object.defineProperty(canvas, 'clientWidth', { value: clientWidth });
  Object.defineProperty(canvas, 'clientHeight', { value: clientHeight });
  vi.spyOn(canvas, 'getContext').mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );

  const field = await createField(canvas, { color: '#245385' });

  return { field, wasm, context, canvas };
};

/* Runs the frame the loop has queued, and returns the next one. */
const advance = (at: number): void => {
  const queued = (requestAnimationFrame as Mock).mock.calls.at(-1)?.[0];

  queued?.(at);
};

describe('createField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn<() => number>(() => 1),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn<() => void>());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('fetches the compiled module', async () => {
    await setup();

    expect(fetch).toHaveBeenNthCalledWith(1, source);
  });

  it('hands the simulation the parity constants', async () => {
    const { wasm } = await setup();

    expect(wasm.configure).toHaveBeenNthCalledWith(
      1,
      options.count,
      options.speed,
      options.size,
      options.bubbleDistance,
      options.bubbleDuration,
    );
  });

  it('sizes the simulation in CSS pixels', async () => {
    const { wasm } = await setup({ ratio: 2 });

    expect(wasm.resize).toHaveBeenNthCalledWith(1, 1280, 800);
  });

  /* detectRetina: the backing store is scaled up and the context scaled back
     down, so a 2x display draws sharp rather than upscaling a blurry buffer. */
  it('scales the backing store by the device pixel ratio', async () => {
    const { canvas, context } = await setup({ ratio: 2 });

    expect(canvas.width).toBe(2560);
    expect(canvas.height).toBe(1600);
    expect(context?.setTransform).toHaveBeenNthCalledWith(1, 2, 0, 0, 2, 0, 0);
  });

  it('falls back to a ratio of 1 where there is none', async () => {
    const { canvas } = await setup({ ratio: 0 });

    expect(canvas.width).toBe(1280);
  });

  it('starts the loop', async () => {
    await setup();

    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  describe('each frame', () => {
    it('advances the simulation by the elapsed time', async () => {
      const { wasm } = await setup();

      vi.spyOn(performance, 'now').mockReturnValue(1000);
      advance(1016);

      expect(wasm.tick).toHaveBeenCalledTimes(1);
      expect((wasm.tick as Mock).mock.calls[0][0]).toBeLessThanOrEqual(50);
    });

    /* A backgrounded tab returns a delta of minutes. Advancing by it would
       teleport the whole field on the frame the tab is restored. */
    it('clamps a frame that took too long', async () => {
      const { wasm } = await setup();

      advance(performance.now() + 60_000);

      expect((wasm.tick as Mock).mock.calls[0][0]).toBe(50);
    });

    it('draws one arc per particle', async () => {
      const { context } = await setup({ wasm: createWasm({ count: 3 }) });

      advance(performance.now() + 16);

      expect(context?.arc).toHaveBeenCalledTimes(3);
    });

    it('clears the canvas before drawing', async () => {
      const { context } = await setup();

      advance(performance.now() + 16);

      expect(context?.clearRect).toHaveBeenNthCalledWith(1, 0, 0, 1280, 800);
    });

    it('draws in the colour it was given', async () => {
      const { context } = await setup();

      advance(performance.now() + 16);

      expect(context?.fillStyle).toBe('#245385');
    });

    it('draws each particle where the simulation put it', async () => {
      const { context } = await setup({ wasm: createWasm({ count: 1 }) });

      advance(performance.now() + 16);

      expect(context?.arc).toHaveBeenNthCalledWith(
        1,
        10,
        20,
        options.size,
        0,
        Math.PI * 2,
      );
    });

    /* The bubble is one number per particle; size and opacity are interpolated
       across it here rather than in the simulation. */
    it('grows a fully bubbled particle to the bubble size', async () => {
      const { context } = await setup({
        wasm: createWasm({ count: 1, bubbles: [1] }),
      });

      advance(performance.now() + 16);

      expect((context?.arc as Mock).mock.calls[0][2]).toBe(options.bubbleSize);
    });

    it('interpolates size across a partial bubble', async () => {
      const { context } = await setup({
        wasm: createWasm({ count: 1, bubbles: [0.5] }),
      });

      advance(performance.now() + 16);

      expect((context?.arc as Mock).mock.calls[0][2]).toBeCloseTo(
        options.size + (options.bubbleSize - options.size) * 0.5,
      );
    });

    it('queues the next frame', async () => {
      await setup();

      advance(performance.now() + 16);

      expect(requestAnimationFrame).toHaveBeenCalledTimes(2);
    });
  });

  describe('the pointer', () => {
    it('follows it', async () => {
      const { wasm } = await setup();

      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 400, clientY: 300 }),
      );
      advance(performance.now() + 16);

      expect((wasm.tick as Mock).mock.calls[0].slice(1)).toEqual([400, 300]);
    });

    /* Parked far enough away that nothing is ever within the bubble radius,
       rather than tracked to an edge where it would still pull particles. */
    it('forgets it when it leaves the window', async () => {
      const { wasm } = await setup();

      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 400, clientY: 300 }),
      );
      window.dispatchEvent(new PointerEvent('pointerleave'));
      advance(performance.now() + 16);

      const [, x, y] = (wasm.tick as Mock).mock.calls[0];

      expect(x).toBeLessThan(-1000);
      expect(y).toBeLessThan(-1000);
    });
  });

  describe('on resize', () => {
    it('reflows the simulation', async () => {
      const { wasm } = await setup();

      window.dispatchEvent(new Event('resize'));

      expect(wasm.resize).toHaveBeenCalledTimes(2);
    });
  });

  describe('destroy', () => {
    it('stops the loop', async () => {
      const { field } = await setup();

      field.destroy();

      expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);
    });

    it('stops listening to the window', async () => {
      const { field, wasm } = await setup();

      field.destroy();
      window.dispatchEvent(new Event('resize'));

      expect(wasm.resize).toHaveBeenCalledTimes(1);
    });
  });

  /* No 2D context is not worth surfacing: the field is decoration and the
     page is correct without it. */
  describe('where there is no 2D context', () => {
    it('does not start a loop', async () => {
      await setup({ context: null });

      expect(requestAnimationFrame).toHaveBeenCalledTimes(0);
    });

    it('returns a field that is safe to destroy', async () => {
      const { field } = await setup({ context: null });

      expect(() => field.destroy()).not.toThrow();
    });
  });
});
