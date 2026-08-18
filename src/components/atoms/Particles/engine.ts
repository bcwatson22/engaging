/* The JavaScript half of the particle field. Rust simulates; this draws.

   The module exposes a pointer into its own linear memory, so a Float32Array
   laid over it is the particle buffer — read directly each frame, with nothing
   crossing the boundary per particle. */

/* The parity spec, kept here rather than in Rust so the numbers a reader wants
   to change sit next to the drawing code that uses most of them. tsparticles
   scaled `count` by canvas area against a 1920x1080 reference, so this is the
   configured number rather than the rendered one — the module does that sum. */
const options = {
  count: 600,
  speed: 0.25,
  size: 2.2,
  opacity: 0.3,
  bubbleDistance: 175,
  bubbleSize: 4,
  bubbleOpacity: 0.6,
} as const;

const source = '/particles.wasm';

/* Far enough away that no particle is ever within the bubble radius of it. */
const noPointer = -1e9;

/* A frame longer than this is a tab that was backgrounded or a thread that
   stalled; advancing by the real delta would teleport the whole field. */
const maxFrameMs = 50;

type Exports = {
  memory: WebAssembly.Memory;
  configure: (
    count: number,
    speed: number,
    radius: number,
    bubbleRange: number,
  ) => void;
  resize: (width: number, height: number) => void;
  tick: (dt: number, pointerX: number, pointerY: number) => void;
  data_ptr: () => number;
  count: () => number;
  stride: () => number;
};

type Field = {
  destroy: () => void;
};

type Options = {
  color: string;
};

/* Plain fetch + instantiate rather than instantiateStreaming: streaming needs
   the response to carry application/wasm and buys nothing measurable on a 4KB
   module, while this works wherever fetch does and is one code path. */
const instantiate = async (): Promise<Exports> => {
  const response = await fetch(source);
  const { instance } = await WebAssembly.instantiate(
    await response.arrayBuffer(),
    {},
  );

  return instance.exports as Exports;
};

const createField = async (
  canvas: HTMLCanvasElement,
  { color }: Options,
): Promise<Field> => {
  const wasm = await instantiate();
  const context = canvas.getContext('2d');

  if (!context) {
    /* No 2D context is not an error worth surfacing: the field is decoration,
       and the page is correct without it. */
    return { destroy: (): void => {} };
  }

  wasm.configure(
    options.count,
    options.speed,
    options.size,
    options.bubbleDistance,
  );

  let view = new Float32Array(0);
  let width = 0;
  let height = 0;
  let pointerX = noPointer;
  let pointerY = noPointer;

  const resize = (): void => {
    const ratio = window.devicePixelRatio || 1;

    width = canvas.clientWidth;
    height = canvas.clientHeight;

    /* detectRetina: the backing store is scaled by the device pixel ratio and
       the context scaled back down, so a 2x display draws sharp rather than
       upscaling a blurry buffer. */
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    wasm.resize(width, height);

    /* Re-laid after every resize. The module never grows its memory, but a
       view is still only valid for the count it was created with. */
    view = new Float32Array(
      wasm.memory.buffer,
      wasm.data_ptr(),
      wasm.count() * wasm.stride(),
    );
  };

  const draw = (): void => {
    const count = wasm.count();
    const stride = wasm.stride();

    context.clearRect(0, 0, width, height);
    context.fillStyle = color;

    for (let i = 0; i < count; i++) {
      const offset = i * stride;
      const bubble = view[offset + 4];

      context.globalAlpha =
        options.opacity + (options.bubbleOpacity - options.opacity) * bubble;

      context.beginPath();
      context.arc(
        view[offset],
        view[offset + 1],
        options.size + (options.bubbleSize - options.size) * bubble,
        0,
        Math.PI * 2,
      );
      context.fill();
    }

    context.globalAlpha = 1;
  };

  const onPointerMove = (event: PointerEvent): void => {
    pointerX = event.clientX;
    pointerY = event.clientY;
  };

  const onPointerLeave = (): void => {
    pointerX = noPointer;
    pointerY = noPointer;
  };

  let frame = 0;
  let last = performance.now();

  const step = (now: number): void => {
    wasm.tick(Math.min(now - last, maxFrameMs), pointerX, pointerY);
    last = now;
    draw();
    frame = requestAnimationFrame(step);
  };

  resize();

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerleave', onPointerLeave);

  frame = requestAnimationFrame(step);

  return {
    destroy: (): void => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    },
  };
};

export { createField, options, source };
export type { Field, Options };
