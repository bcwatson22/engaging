import { createField } from '@bcwatson22/motes';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import type { Mock } from 'vitest';

import { controls, initialColor, Motes, snippetFor } from './Motes';

vi.mock('@bcwatson22/motes', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@bcwatson22/motes')>()),
  createField: vi.fn<typeof import('@bcwatson22/motes').createField>(),
}));

const update = vi.fn<() => void>();
const destroy = vi.fn<() => void>();

type Options = {
  prefersReducedMotion?: boolean;
  /* Left pending, to stand in for a field still instantiating. */
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

/* Anchored, or "Size" also matches "Bubble size". The accessible name carries
   the current value after the label, hence the trailing wildcard. */
const sliderFor = (label: string): HTMLElement =>
  screen.getByRole('slider', { name: new RegExp(`^${label}\\b`, 'i') });

/* Two elements carry the code role — the generated config and the media
   feature named in the note above it — so this picks the one that is a config
   rather than reaching for a test id. */
const snippet = (): string =>
  screen
    .getAllByRole('code')
    .find((element) => element.textContent?.includes('createField'))
    ?.textContent ?? '';

/* jsdom does not implement a range input's keyboard behaviour, so a change
   event is how a slider is driven in a test. The query is still by role. */
const drag = (label: string, value: number): void => {
  fireEvent.change(sliderFor(label), { target: { value: String(value) } });
};

describe('Motes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
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

  /* Unmounting while the field is still instantiating would otherwise leave
     one running with nothing holding a reference to stop it. */
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

    /* update rather than a new field: recreating on every input event would
       restart the animation on every pixel of a drag. */
    it('updates the running field rather than restarting it', async () => {
      setup();

      await vi.waitFor(() => expect(createField).toHaveBeenCalledTimes(1));

      drag('Speed', 1.5);

      expect(update).toHaveBeenNthCalledWith(1, { speed: 1.5 });
      expect(createField).toHaveBeenCalledTimes(1);
    });

    it('reflects the value it was dragged to', () => {
      setup();

      drag('Count', 1200);

      expect(sliderFor('Count')).toHaveValue('1200');
    });

    it('changes the colour', async () => {
      setup();

      await vi.waitFor(() => expect(createField).toHaveBeenCalledTimes(1));

      fireEvent.change(screen.getByLabelText(/colour/i), {
        target: { value: '#f9fafb' },
      });

      expect(update).toHaveBeenNthCalledWith(1, { color: '#f9fafb' });
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

      drag('Speed', 1.5);

      expect(snippet()).toContain('speed: 1.5');
    });

    it('drops it again when it is put back', () => {
      setup();

      drag('Speed', 1.5);
      drag('Speed', 0.25);

      expect(snippet()).not.toContain('speed:');
    });
  });

  describe('reset', () => {
    it('puts every setting back', async () => {
      const { user } = setup();

      drag('Speed', 1.5);

      await user.click(screen.getByRole('button', { name: /reset/i }));

      expect(snippet()).not.toContain('speed:');
    });
  });

  describe('copying', () => {
    /* userEvent.setup installs its own clipboard, so the assertion reads back
       what the button wrote rather than stubbing navigator — replacing that
       wholesale breaks userEvent's own click handling. */
    it('writes the snippet to the clipboard and says so', async () => {
      const { user } = setup();
      const expected = snippet();

      await user.click(screen.getByRole('button', { name: /copy/i }));

      expect(await navigator.clipboard.readText()).toBe(expected);
      expect(
        await screen.findByRole('button', { name: /copied/i }),
      ).toBeInTheDocument();
    });
  });

  /* The field draws a single static frame under reduced motion rather than
     animating, which looks like a failure unless the page says otherwise. */
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

    /* Without this someone with the preference on cannot see the demo at all.
       Opt-in, never on by default. */
    it('offers to animate anyway', () => {
      setup({ prefersReducedMotion: true });

      const override = screen.getByRole('checkbox', { name: /animate/i });

      expect(override).toBeInTheDocument();
      expect(override).not.toBeChecked();
    });

    it('rebuilds the field without the preference when asked', async () => {
      const { user } = setup({ prefersReducedMotion: true });

      await vi.waitFor(() => expect(createField).toHaveBeenCalledTimes(1));
      expect((createField as Mock).mock.calls[0][1]).toMatchObject({
        respectReducedMotion: true,
      });

      await user.click(screen.getByRole('checkbox', { name: /animate/i }));

      await vi.waitFor(() => expect(createField).toHaveBeenCalledTimes(2));
      expect((createField as Mock).mock.calls[1][1]).toMatchObject({
        respectReducedMotion: false,
      });
    });

    it('stops saying the field is still once it is not', async () => {
      const { user } = setup({ prefersReducedMotion: true });

      await user.click(screen.getByRole('checkbox', { name: /animate/i }));

      expect(screen.queryByText(/asks for reduced motion/i)).toBeNull();
    });
  });

  /* A switch that does nothing is worse than no switch. */
  it('does not offer to animate anyway when nothing is holding it back', () => {
    setup();

    expect(screen.queryByRole('checkbox', { name: /animate/i })).toBeNull();
  });

  /* A section is only a landmark once it has a name, and this one has no
     heading to take one from. */
  it('names the region it occupies', () => {
    setup();

    expect(
      screen.getByRole('region', { name: /particle field demo/i }),
    ).toBeInTheDocument();
  });

  it('renders without a media query to read', () => {
    expect(() => renderToString(<Motes />)).not.toThrow();
  });

  describe('snippetFor', () => {
    it('omits anything left at its default', () => {
      const result = snippetFor('#ffffff', {
        count: 600,
        speed: 0.25,
        size: 2.2,
        opacity: 0.3,
        bubbleSize: 4,
        bubbleDistance: 175,
      });

      expect(result).toContain("color: '#ffffff'");
      expect(result).not.toContain('count:');
    });

    it('includes anything that differs', () => {
      const result = snippetFor('#ffffff', {
        count: 1200,
        speed: 0.25,
        size: 2.2,
        opacity: 0.3,
        bubbleSize: 4,
        bubbleDistance: 175,
      });

      expect(result).toContain('count: 1200');
    });
  });
});
