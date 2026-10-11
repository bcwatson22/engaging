From oxlint's 2.0.0 release notes:

> **Breaking:** `typescript-eslint(no-unnecessary-condition)` is now enabled by
> the `correctness` category rather than `pedantic`, and no longer has an
> option to allow conditions on values typed as `unknown`.

The rule now reports every branch that guards a value TypeScript can prove is
truthy. In this repo it fires 34 times, all of them in `src/data/functions/`,
on the `if (parsed.data)` guards that follow every `safeParse` call. Those
guards are what make the fallback path reachable, and the fallback path is
covered by tests that assert what the site serves when Hygraph is unreachable.
Removing the guards would make the fallback unreachable and drop coverage below
100%; keeping them means the new rule fails.
