import '@testing-library/jest-dom/vitest';

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
