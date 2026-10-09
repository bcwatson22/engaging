---
type: regex
weight: 3
flags: i
match: not_contains
---

remov\w*\s+(pnpm\s+)?lint:types|drop\w*\s+lint:types|\|\| true|--no-verify|oxlint-disable|eslint-disable|@ts-expect-error|@ts-ignore|edit\w*\s+the\s+verify\s+script|chang\w*\s+the\s+verify\s+script|fix\w*\s+getStatus
