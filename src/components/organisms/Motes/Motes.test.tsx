import { createField, defaults } from '@bcwatson22/motes';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import type { Mock } from 'vitest';

import {
  controls,
  copiedFor,
  initialColor,
  initialValues,
  linesFor,
  Motes,
  snippetFor,
} from './Motes';

vi.mock('@bcwatson22/motes', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@bcwatson22/motes')>()),
  createField: vi.fn<typeof import('@bcwatson22/motes').createField>(),
}));

const speed = 1.5;
const count = 1200;
const color = '#f9fafb';

const update = vi.fn<() => void>();
const destroy = vi.fn<() => void>();

type Options = {
  prefersReducedMotion?: boolean;
  isLoading?: boolean;
  fails?: boolean;
};

const setup = ({
  prefersReducedMotion = false,
  isLoading,
  fails,
}: Options = {}) => {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: query.includes('reduced-motion')
          ? prefersReducedMotion
          : false,
        media: query,
        addEventListener: vi.fn<() => void>(),
        removeEventListener: vi.fn<() => void>(),
      }) as unknown as MediaQueryList,
  );

  (createField as Mock).mockImplementation(() => {
    if (isLoading) return new Promise(() => {});
    if (fails) return Promise.reject(new Error('no wasm'));

    return Promise.resolve({ update, destroy });
  });

  return { user: userEvent.setup(), ...render(<Motes />) };
};

const sliderFor = (label: string): HTMLElement =>
  screen.getByRole('slider', { name: new RegExp(`^${label}\\b`, 'i') });

const snippet = (): string => {
  const block = screen
    .getAllByRole('code')
    .find((element) => element.textContent?.includes('createField'));

  return Array.from(block?.querySelectorAll('[data-shown="true"]') ?? [])
    .map((row) => row.textContent)
    .join('\n');
};

const drag = (label: string, value: number): void => {
  fireEvent.change(sliderFor(label), { target: { value: String(value) } });
};

describe('Motes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('has no detectable WCAG A or AA violations', async () => {
    const { container } = setup();

    await expect(container).toHaveNoViolations();
  });

  afterEach(() => vi.restoreAllMocks());

  it('starts a field', async () => {
    setup();

    await vi.waitFor(() => expect(createField).toHaveBeenCalledTimes(1));
  });

  it('stops the field when it unmounts', async () => {
    const { unmount } = setup();

    await vi.waitFor(() => expect(createField).toHaveBeenCalledTimes(1));

    unmount();

    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('stops a field that arrives after it unmounted', async () => {
    let settle: (field: {
      update: () => void;
      destroy: () => void;
    }) => void = () => {};

    vi.spyOn(window, 'matchMedia').mockImplementation(
      () =>
        ({
          matches: false,
          addEventListener: vi.fn<() => void>(),
          removeEventListener: vi.fn<() => void>(),
        }) as never,
    );
    (createField as Mock).mockReturnValue(
      new Promise((resolve) => {
        settle = resolve;
      }),
    );

    const { unmount } = render(<Motes />);

    await vi.waitFor(() => expect(createField).toHaveBeenCalledTimes(1));

    unmount();
    settle({ update, destroy });

    await vi.waitFor(() => expect(destroy).toHaveBeenCalledTimes(1));
  });

  it('does not throw when the field fails to start', async () => {
    setup({ fails: true });

    await vi.waitFor(() => expect(createField).toHaveBeenCalledTimes(1));

    expect(
      screen.getByRole('group', { name: /settings/i }),
    ).toBeInTheDocument();
  });

  describe('the controls', () => {
    it('labels every slider', () => {
      setup();

      for (const { label } of controls) {
        expect(sliderFor(label)).toBeInTheDocument();
      }
    });

    it('updates the running field rather than restarting it', async () => {
      setup();

      await vi.waitFor(() => expect(createField).toHaveBeenCalledTimes(1));

      drag('Speed', speed);

      expect(update).toHaveBeenNthCalledWith(1, { speed });
      expect(createField).toHaveBeenCalledTimes(1);
    });

    it('is named by its label alone', () => {
      setup();

      drag('Count', count);

      expect(screen.getByRole('slider', { name: 'Count' })).toBeInTheDocument();
    });

    it('reflects the value it was dragged to', () => {
      setup();

      drag('Count', count);

      expect(sliderFor('Count')).toHaveValue(String(count));
    });

    it('changes the colour', async () => {
      setup();

      await vi.waitFor(() => expect(createField).toHaveBeenCalledTimes(1));

      fireEvent.change(screen.getByLabelText(/colour/i), {
        target: { value: color },
      });

      expect(update).toHaveBeenNthCalledWith(1, { color });
    });
  });

  describe('the snippet', () => {
    it('shows only the colour when nothing has been changed', () => {
      setup();

      expect(snippet()).toContain(`color: '${initialColor}'`);
      expect(snippet()).not.toContain('speed:');
    });

    it('adds a setting once it differs from the default', async () => {
      setup();

      drag('Speed', speed);

      expect(snippet()).toContain(`speed: ${speed}`);
    });

    it('keeps a defaulted line in the DOM, hidden, so it can animate', () => {
      setup();

      const row = Array.from(
        screen
          .getAllByRole('code')
          .find((element) => element.textContent?.includes('createField'))
          ?.querySelectorAll('[data-shown="false"]') ?? [],
      ).find((hidden) => hidden.textContent?.includes('speed:'));

      expect(row).toBeInTheDocument();
      expect(row).toHaveAttribute('aria-hidden', 'true');
    });

    it('drops it again when it is put back', () => {
      setup();

      drag('Speed', speed);
      drag('Speed', defaults.speed);

      expect(snippet()).not.toContain('speed:');
    });
  });

  describe('reset', () => {
    it('puts every setting back', async () => {
      const { user } = setup();

      drag('Speed', speed);

      await user.click(screen.getByRole('button', { name: /reset/i }));

      expect(snippet()).not.toContain('speed:');
    });
  });

  describe('copying', () => {
    it('writes the snippet to the clipboard and says so', async () => {
      const { user } = setup();
      const expected = snippet();

      await user.click(screen.getByRole('button', { name: /copy/i }));

      expect(await navigator.clipboard.readText()).toBe(expected);
      expect(
        await screen.findByRole('button', { name: /copied/i }),
      ).toBeInTheDocument();
    });

    it('announces the copy', async () => {
      const { user } = setup();

      expect(screen.getByRole('status')).toHaveTextContent('');

      await user.click(screen.getByRole('button', { name: /copy/i }));

      expect(
        await screen.findByText('Config copied to the clipboard'),
      ).toHaveRole('status');
    });

    it('offers to copy again after a moment', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const { user } = setup();

      await user.click(screen.getByRole('button', { name: /copy/i }));
      await screen.findByRole('button', { name: /copied/i });

      act(() => {
        vi.advanceTimersByTime(copiedFor);
      });

      expect(
        screen.getByRole('button', { name: 'Copy config' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent('');

      vi.useRealTimers();
    });
  });

  describe('under reduced motion', () => {
    it('says the field is deliberately still', () => {
      setup({ prefersReducedMotion: true });

      expect(screen.getByText(/reduced motion/i)).toBeInTheDocument();
    });

    it('still offers every control', () => {
      setup({ prefersReducedMotion: true });

      for (const { label } of controls) {
        expect(sliderFor(label)).toBeInTheDocument();
      }
    });

    it('offers to animate anyway', () => {
      setup({ prefersReducedMotion: true });

      const override = screen.getByRole('checkbox', { name: /animate/i });

      expect(override).toBeInTheDocument();
      expect(override).not.toBeChecked();
    });

    it('rebuilds the field without the preference when asked', async () => {
      const { user } = setup({ prefersReducedMotion: true });

      await vi.waitFor(() =>
        expect(createField).toHaveBeenNthCalledWith(
          1,
          expect.any(HTMLCanvasElement),
          expect.objectContaining({ respectReducedMotion: true }),
        ),
      );

      await user.click(screen.getByRole('checkbox', { name: /animate/i }));

      await vi.waitFor(() =>
        expect(createField).toHaveBeenNthCalledWith(
          2,
          expect.any(HTMLCanvasElement),
          expect.objectContaining({ respectReducedMotion: false }),
        ),
      );
    });

    it('stops saying the field is still once it is not', async () => {
      const { user } = setup({ prefersReducedMotion: true });

      await user.click(screen.getByRole('checkbox', { name: /animate/i }));

      expect(screen.queryByText(/asks for reduced motion/i)).toBeNull();
    });
  });

  it('does not offer to animate anyway when nothing is holding it back', () => {
    setup();

    expect(screen.queryByRole('checkbox', { name: /animate/i })).toBeNull();
  });

  it('names the region it occupies', () => {
    setup();

    expect(screen.getByRole('region', { name: /motes/i })).toBeInTheDocument();
  });

  describe('the package links', () => {
    it('is a nav of its own', () => {
      setup();

      expect(
        screen.getByRole('navigation', { name: /motes package/i }),
      ).toBeInTheDocument();
    });

    it('points at npm and the docs', () => {
      setup();

      expect(screen.getByRole('link', { name: /npm/i })).toHaveAttribute(
        'href',
        'https://www.npmjs.com/package/@bcwatson22/motes',
      );
      expect(screen.getByRole('link', { name: /docs/i })).toHaveAttribute(
        'href',
        'https://github.com/bcwatson22/motes',
      );
    });
  });

  it('renders without a media query to read', () => {
    expect(() => renderToString(<Motes />)).not.toThrow();
  });

  describe('linesFor', () => {
    it('keeps a defaulted line, so it has something to transition', () => {
      const line = linesFor(initialColor, initialValues).find(
        ({ key }) => key === 'count',
      );

      expect(line).toMatchObject({
        text: `  count: ${defaults.count},`,
        shown: false,
      });
    });

    it('shows a line once its setting differs', () => {
      const line = linesFor(initialColor, { ...initialValues, count }).find(
        ({ key }) => key === 'count',
      );

      expect(line).toMatchObject({ text: `  count: ${count},`, shown: true });
    });

    it('always shows the lines that are not a setting', () => {
      const fixed = linesFor(initialColor, initialValues).filter(
        ({ key }) => !controls.some((control) => control.key === key),
      );

      expect(fixed.every(({ shown }) => shown)).toBe(true);
    });
  });

  describe('snippetFor', () => {
    it('omits anything left at its default', () => {
      const result = snippetFor(initialColor, initialValues);

      expect(result).toContain(`color: '${initialColor}'`);
      expect(result).not.toContain('count:');
    });

    it('includes anything that differs', () => {
      const result = snippetFor(initialColor, { ...initialValues, count });

      expect(result).toContain(`count: ${count}`);
    });
  });
});
