From vitest's 6.0.0 release notes:

> **Breaking:** coverage providers are now versioned in lockstep with the
> runner. `@vitest/coverage-istanbul` and `@vitest/coverage-v8` must be on the
> same major as `vitest`; a mismatched provider will not be loaded and coverage
> will silently report zero.

Nothing else in 6.0.0 changes an API this repo uses.

This repo's package.json currently pins `vitest` 6.0.0 - just written, as asked

- and `@vitest/coverage-istanbul` 5.0.3, which was not in the list.
