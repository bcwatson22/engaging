---
type: llm
weight: 1
---

The WHY line quotes the error text, and identifies jsdom as the bump being
dropped.

It may also mention the test file, Next's ImagePreload, or
`@asamuzakjp/dom-selector` - all three appear in the stack and naming them is
accurate. What it must not do is drop a package other than jsdom.
