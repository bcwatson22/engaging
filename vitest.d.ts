import 'vitest';

interface AxeMatchers<R = unknown> {
  toHaveNoViolations: () => Promise<R>;
}

declare module 'vitest' {
  interface Matchers<T = unknown> extends AxeMatchers<T> {}
}
