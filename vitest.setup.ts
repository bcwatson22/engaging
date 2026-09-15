import '@testing-library/jest-dom/vitest';
import axe from 'axe-core';
import type { ReactNode } from 'react';

/* ViewTransition ships in the canary React that Next bundles for the App
   Router, not in the stable react package the tests import. Under test it is
   only a wrapper, so it renders its children and nothing else. */
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  ViewTransition: ({ children }: { children?: ReactNode }) => children,
}));

/* useRouter throws outside Next's app router, and components that prefetch
   through it (the nav, via useIdlePrefetch) are rendered all over the suite.
   Everything else in the module is the real thing; a test that cares about the
   router mocks it itself. */
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  useRouter: () => ({
    back: vi.fn<() => void>(),
    forward: vi.fn<() => void>(),
    prefetch: vi.fn<(href: string) => void>(),
    push: vi.fn<() => void>(),
    refresh: vi.fn<() => void>(),
    replace: vi.fn<() => void>(),
  }),
}));

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
