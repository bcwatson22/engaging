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
import type { Link } from '@/components/atoms/Link/Link';
import { Nav } from '@/components/molecules/Nav/Nav';

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

const initialColor = '#ffffff';

const demoCount = 1600;

const initialValues: Values = {
  count: demoCount,
  speed: defaults.speed,
  size: defaults.size,
  opacity: defaults.opacity,
  bubbleSize: defaults.bubbleSize,
  bubbleDistance: defaults.bubbleDistance,
};

const packageLinks: Link[] = [
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

const copiedFor = 2000;

const subscribeToMotion = (onChange: () => void): (() => void) => {
  const list = window.matchMedia(motionQuery);

  list.addEventListener('change', onChange);

  return () => list.removeEventListener('change', onChange);
};

const prefersReducedMotion = (): boolean =>
  window.matchMedia(motionQuery).matches;

const prefersReducedMotionOnServer = (): boolean => true;

type Line = { key: string; text: string; shown: boolean };

const linesFor = (color: string, values: Values): Line[] =>
  [
    { key: 'import', text: "import { createField } from '@bcwatson22/motes';" },
    { key: 'blank', text: '' },
    { key: 'open', text: 'const field = await createField(canvas, {' },
    { key: 'color', text: `  color: '${color}',` },
    ...controls.map(({ key }) => ({
      key,
      text: `  ${key}: ${values[key]},`,
      shown: values[key] !== defaults[key],
    })),
    { key: 'close', text: '});' },
  ].map((line) => ({ shown: true, ...line }));

const snippetFor = (color: string, values: Values): string =>
  linesFor(color, values)
    .filter(({ shown }) => shown)
    .map(({ text }) => text)
    .join('\n');

const Motes = () => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const fieldRef = useRef<Field | null>(null);

  const [color, setColor] = useState<string>(initialColor);
  const [values, setValues] = useState<Values>(initialValues);
  const headingId = useId();
  const [isCopied, setIsCopied] = useState<boolean>(false);
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
  }, [canvas, isOverridden]);

  const handleChange = useCallback((key: Setting, value: number): void => {
    setValues((current) => ({ ...current, [key]: value }));
    fieldRef.current?.update({ [key]: value });
  }, []);

  const handleChangeColor = useCallback((next: string): void => {
    setColor(next);
    fieldRef.current?.update({ color: next });
  }, []);

  const handleReset = useCallback((): void => {
    setColor(initialColor);
    setValues(initialValues);
    fieldRef.current?.update({ color: initialColor, ...initialValues });
  }, []);

  const lines = linesFor(color, values);
  const snippet = snippetFor(color, values);

  const handleCopy = useCallback((): void => {
    void navigator.clipboard.writeText(snippet).then(() => setIsCopied(true));
  }, [snippet]);

  useEffect(() => {
    if (!isCopied) return;

    const handle = window.setTimeout(() => setIsCopied(false), copiedFor);

    return () => window.clearTimeout(handle);
  }, [isCopied]);

  return (
    <section aria-labelledby={headingId} className="motes-demo">
      <header>
        <h2 id={headingId} className="font-mono text-2xl">
          motes
        </h2>
        <p>
          A drifting particle field for a canvas, in 4.4KB gzipped. The
          simulation is written in Rust and compiled to WebAssembly; the drawing
          stays in TypeScript. It is what paints the background of this site.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isStill && !isOverridden ? (
            'Your system asks for reduced motion, so the field is drawn once and left still. Every setting below still applies.'
          ) : (
            <>
              Drag anything. The field updates as you go rather than restarting,
              and your pointer, or a tap, pulls the particles near it. It
              honours{' '}
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
          <canvas ref={setCanvas} aria-hidden="true" />
        </div>

        <fieldset className="controls">
          <legend className="sr-only">Particle settings</legend>

          {isStill && (
            <label className="flex-row items-center gap-2">
              <input
                type="checkbox"
                className="accent-brand-blue dark:accent-brand-yellow size-4"
                checked={isOverridden}
                onChange={({ target: { checked } }) => setIsOverridden(checked)}
              />
              <span>Animate anyway</span>
            </label>
          )}

          <label>
            <span>Colour</span>
            <input
              type="color"
              value={color}
              onChange={({ target: { value } }) => handleChangeColor(value)}
            />
          </label>

          {controls.map(({ key, label, min, max, step }) => (
            <label key={key}>
              <span>
                {label}{' '}
                <span className="value" aria-hidden="true">
                  {values[key]}
                </span>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={values[key]}
                onChange={({ target: { value } }) =>
                  handleChange(key, Number(value))
                }
              />
            </label>
          ))}

          <div className="flex flex-wrap gap-2">
            <Button icon="Retry" onClick={handleReset}>
              Reset
            </Button>
            <Button icon={isCopied ? 'Check' : 'Copy'} onClick={handleCopy}>
              {isCopied ? 'Copied' : 'Copy config'}
            </Button>
          </div>

          <output className="sr-only">
            {isCopied ? 'Config copied to the clipboard' : ''}
          </output>

          <pre>
            <code>
              {lines.map(({ key, text, shown }) => (
                <span
                  key={key}
                  className="reveal"
                  data-shown={shown}
                  aria-hidden={!shown || undefined}
                >
                  <span>{text}</span>
                </span>
              ))}
            </code>
          </pre>
        </fieldset>
      </div>
    </section>
  );
};

export {
  controls,
  copiedFor,
  initialColor,
  initialValues,
  linesFor,
  Motes,
  snippetFor,
};
