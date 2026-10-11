From motion's 14.0.0 release notes:

> **Breaking:** `useInView` no longer accepts a `once` option. Pass
> `{ amount: "some" }` and unsubscribe in the callback instead, or use the new
> `useInViewOnce` hook which does exactly what `once: true` did.

> **Breaking:** the `initial={false}` shorthand on `AnimatePresence` is
> removed. Use `mode="wait"` with `initial` omitted.

Nothing else in 14.0.0 changes a public API.
