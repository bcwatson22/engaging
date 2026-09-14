import '@testing-library/jest-dom/vitest';
import axe from 'axe-core';

/* jsdom does not implement matchMedia, and anything reading a media query at
   runtime — a colour scheme, reduced motion — throws without it rather than
   falling back. Defaults to not matching, so a test that cares about the
   dark scheme opts in by overriding `matches`. */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }) as unknown as MediaQueryList,
});

/* An automated WCAG 2.2 A and AA pass over whatever a test rendered.

   Colour contrast is off because jsdom does no layout or painting, so axe
   cannot compute a colour and reports every text node as needing review.
   Contrast is checked in a real browser instead. Everything else — names,
   roles, ARIA validity, labels, lists, landmark nesting — is structural and
   reliable here. Scoped to the WCAG tags rather than best-practice, because
   the page-level best practices (one main, a level-one heading) cannot hold
   for a component rendered on its own. */
const wcag = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

expect.extend({
  async toHaveNoViolations(received: Element) {
    const { violations } = await axe.run(received, {
      runOnly: { type: 'tag', values: wcag },
      rules: { 'color-contrast': { enabled: false } },
    });

    return {
      pass: violations.length === 0,
      message: () =>
        violations
          .map(
            ({ id, help, nodes }) =>
              `${id}: ${help}\n${nodes.map(({ html }) => `  ${html}`).join('\n')}`,
          )
          .join('\n\n') || 'Expected accessibility violations, found none',
    };
  },
});
