---
type: llm
weight: 1
---

The WHY line quotes the error text and attributes it to jsdom specifically,
rather than to the test file, to Next, or to the dom-selector package that
raised it. Those appear in the stack; jsdom is the bump being dropped.
