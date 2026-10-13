From vitest's 6.0.0 release notes:

> **Breaking:** the jsdom environment now requires jsdom 31 or later. Earlier
> versions are not loaded, and `environment: 'jsdom'` fails at startup.

> **Breaking:** coverage providers move in lockstep with the runner, so
> `@vitest/coverage-istanbul` must be on 6.x as well.

Nothing else in 6.0.0 changes an API this repo uses.
