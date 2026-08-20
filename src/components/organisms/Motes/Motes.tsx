'use client';

import { createField, defaults, type Field } from '@bcwatson22/motes';
import {
  useCallback,
  useEffect,
  useRef,
  useId,
  useState,
  useSyncExternalStore,
} from 'react';

import { Button } from '@/components/atoms/Button/Button';
import type { TLink } from '@/components/atoms/Link/Link';
import { Nav } from '@/components/molecules/Nav/Nav';

/* The knobs, in the order they read on screen. Kept as data so the controls,
   the state and the generated snippet cannot drift apart — adding a setting
   means adding one row here and nothing else. */
const controls = [
  { key: 'count', label: 'Count', min: 50, max: 2000, step: 50 },
  { key: 'speed', label: 'Speed', min: 0, max: 3, step: 0.05 },
  { key: 'size', label: 'Size', min: 0.5, max: 12, step: 0.1 },
  { key: 'opacity', label: 'Opacity', min: 0.05, max: 1, step: 0.05 },
  { key: 'bubbleSize', label: 'Bubble size', min: 1, max: 24, step: 0.5 },
  {
    key: 'bubbleDistance',
    label: 'Bubble distance',
    min: 0,
    max: 400,
    step: 5,
  },
] as const;

type Setting = (typeof controls)[number]['key'];

type Values = Record<Setting, number>;

/* White, because the stage below is dark in both colour schemes. */
const initialColor = '#ffffff';

const initialValues: Values = {
  count: defaults.count,
  speed: defaults.speed,
  size: defaults.size,
  opacity: defaults.opacity,
  bubbleSize: defaults.bubbleSize,
  bubbleDistance: defaults.bubbleDistance,
};

/* Where the package lives. A nav of its own rather than a paragraph of links:
   it is a set of destinations, and it sits beside the site's nav rather than
   replacing it. */
const packageLinks: TLink[] = [
  {
    target: 'https://www.npmjs.com/package/@bcwatson22/motes',
    text: 'npm',
    icon: 'Package',
  },
  {
    target: 'https://github.com/bcwatson22/motes',
    text: 'Docs',
    icon: 'Lightbulb',
  },
];

const motionQuery = '(prefers-reduced-motion: reduce)';

/* The field honours reduced motion itself, drawing one static frame instead of
   animating. Read here only so the page can say so — a still field with no
   explanation looks like something failed. */
const subscribeToMotion = (onChange: () => void): (() => void) => {
  const list = window.matchMedia(motionQuery);

  list.addEventListener('change', onChange);

  return () => list.removeEventListener('change', onChange);
};

const prefersReducedMotion = (): boolean =>
  window.matchMedia(motionQuery).matches;

/* Assumed on where there is no query to read, matching how the field itself
   treats the unknown. */
const prefersReducedMotionOnServer = (): boolean => true;

/* What someone came for: the settings they landed on, in a form they can
   paste. Only what differs from the defaults, so the snippet stays short and
   says something. */
const snippetFor = (color: string, values: Values): string => {
  const changed = controls
    .map(({ key }) => key)
    .filter((key) => values[key] !== defaults[key])
    .map((key) => `  ${key}: ${values[key]},`);

  return [
    "import { createField } from '@bcwatson22/motes';",
    '',
    'const field = await createField(canvas, {',
    `  color: '${color}',`,
    ...changed,
    '});',
  ].join('\n');
};

const Motes = () => {
  /* The canvas arrives through state rather than a ref, so the effect can
     depend on it. A ref would need a guard for a null that never actually
     happens; this way the first pass genuinely has no element and the second
     has one. */
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  /* A ref rather than a local, because the controls have to reach the field
     from outside the effect that created it. */
  const fieldRef = useRef<Field | null>(null);

  const [color, setColor] = useState<string>(initialColor);
  const [values, setValues] = useState<Values>(initialValues);
  const headingId = useId();
  const [isCopied, setIsCopied] = useState<boolean>(false);
  /* Opt-in, and only offered to someone whose system asks for less motion —
     see the checkbox below. */
  const [isOverridden, setIsOverridden] = useState<boolean>(false);

  const isStill = useSyncExternalStore(
    subscribeToMotion,
    prefersReducedMotion,
    prefersReducedMotionOnServer,
  );

  useEffect(() => {
    if (!canvas) return;

    let cancelled = false;

    createField(canvas, {
      color: initialColor,
      ...initialValues,
      respectReducedMotion: !isOverridden,
    })
      .then((created) => {
        if (cancelled) {
          created.destroy();

          return;
        }

        fieldRef.current = created;
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      fieldRef.current?.destroy();
      fieldRef.current = null;
    };
    /* Created once per canvas, and again if the visitor asks for the motion
       back. Every other change goes through update, which is the whole point —
       recreating the field on each input event would restart the animation on
       every pixel of a drag. respectReducedMotion is settled when a field is
       made, so this one setting is the exception. */
  }, [canvas, isOverridden]);

  const change = useCallback((key: Setting, value: number): void => {
    setValues((current) => ({ ...current, [key]: value }));
    fieldRef.current?.update({ [key]: value });
  }, []);

  const changeColor = useCallback((next: string): void => {
    setColor(next);
    fieldRef.current?.update({ color: next });
  }, []);

  const reset = useCallback((): void => {
    setColor(initialColor);
    setValues(initialValues);
    fieldRef.current?.update({ color: initialColor, ...initialValues });
  }, []);

  const snippet = snippetFor(color, values);

  const copy = useCallback((): void => {
    void navigator.clipboard.writeText(snippet).then(() => setIsCopied(true));
  }, [snippet]);

  return (
    <section aria-labelledby={headingId} className="motes-demo">
      <header>
        <h2 id={headingId} className="font-mono text-2xl">
          motes
        </h2>
        <p>
          A drifting particle field for a canvas, in 4.3KB gzipped. The
          simulation is written in Rust and compiled to WebAssembly; the drawing
          stays in TypeScript. It is what paints the background of this site.
        </p>
        {/* The reduced-motion sentence only belongs in the second branch. In
            the first the field is already still and has just said so, and
            explaining the behaviour to the one person watching it happen is
            the sort of repetition that reads as filler. */}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isStill && !isOverridden ? (
            'Your system asks for reduced motion, so the field is drawn once and left still. Every setting below still applies.'
          ) : (
            <>
              Drag anything. The field updates as you go rather than restarting,
              and your pointer pulls the particles near it. It honours{' '}
              <code className="font-mono text-xs">prefers-reduced-motion</code>,
              so where a system asks for less motion it is drawn once and left
              still.
            </>
          )}
        </p>
        <Nav links={packageLinks} label="Motes package" className="mt-4" />
      </header>

      <div className="layout">
        <div className="stage">
          {/* aria-hidden because it is decoration: the controls beside it are
            what carries the meaning. */}
          <canvas
            ref={setCanvas}
            aria-hidden="true"
            className="absolute inset-0 block size-full"
          />
        </div>

        {/* A fieldset rather than a form: nothing here is ever submitted, and a
          form that cannot be submitted needs a submit handler purely to stop
          the browser doing something the page does not want. This groups the
          controls and names the group, which is all that was wanted. */}
        <fieldset className="controls">
          <legend className="sr-only">Particle settings</legend>

          {/* The switch itself is offered only where the system asks for less
            motion. Anywhere else it would do nothing, and here it is the
            difference between seeing the demo and not — so it is opt-in, never
            on by default, and the preference stands until someone deliberately
            says otherwise. */}
          {isStill && (
            <label className="flex-row items-center gap-2">
              <input
                type="checkbox"
                className="accent-brand-blue dark:accent-brand-yellow size-4"
                checked={isOverridden}
                onChange={(event) => setIsOverridden(event.target.checked)}
              />
              <span>Animate anyway</span>
            </label>
          )}

          <label>
            <span>Colour</span>
            <input
              type="color"
              className="border-brand-blue dark:border-brand-yellow h-10 w-full cursor-pointer rounded-sm border-2 bg-transparent p-1"
              value={color}
              onChange={(event) => changeColor(event.target.value)}
            />
          </label>

          {controls.map(({ key, label, min, max, step }) => (
            <label key={key}>
              {/* A span, not an <output>. Output is a labelable element, so a
                label wrapping both it and the input would name the output and
                leave the slider with no accessible name at all. */}
              <span>
                {label}{' '}
                <span className="font-mono text-xs text-gray-600 tabular-nums dark:text-gray-400">
                  {values[key]}
                </span>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={values[key]}
                onChange={(event) => change(key, Number(event.target.value))}
              />
            </label>
          ))}

          <div className="flex flex-wrap gap-2">
            <Button icon="Retry" onClick={reset}>
              Reset
            </Button>
            {/* The icon changes with the label, so the feedback reads at a
                glance rather than only on close inspection. */}
            <Button icon={isCopied ? 'Check' : 'Copy'} onClick={copy}>
              {isCopied ? 'Copied' : 'Copy config'}
            </Button>
          </div>

          <pre className="bg-brand-dark/5 dark:bg-brand-light/5 overflow-x-auto rounded-sm p-3 text-xs">
            <code>{snippet}</code>
          </pre>
        </fieldset>
      </div>
    </section>
  );
};

export { controls, initialColor, initialValues, Motes, snippetFor };
