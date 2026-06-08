---
name: bwu-finish
description: "Finalize a BWU for merge. Verify exports, add changeset, generate PR description. Use after /bwu-test."
---

# /bwu-finish <package> <algorithm>

Step 4 of the BWU SOP: finalize for PR.

## Checklist

1. Function exported from `packages/<package>/src/index.ts`
2. Subpath export in `packages/<package>/package.json`
3. `pnpm turbo build && pnpm turbo test && pnpm turbo typecheck` — all pass
4. `pnpm format:check` passes
5. Run `pnpm changeset` — add changeset for this binding
6. Update BINDINGS.md: status → `done`, date → today

## PR Description Template

```
feat(<package>): wire <algorithm> WASM binding

## Summary
- Implemented `<function>()` in `@graphrs/<package>`
- Marshals graph data to WASM, calls igraph-wasm export, parses result
- Added N tests covering basic usage, edge cases, and property checks

## BWU: BWU-XXX-NNN

## Test plan
- [x] Unit tests pass
- [x] Edge case tests pass
- [x] Build succeeds
- [x] Typecheck passes
```
