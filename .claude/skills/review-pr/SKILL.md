---
name: review-pr
description: "Structured PR review against SOP checklist. Use when asked to review a PR."
---

# /review-pr

Review against the SOP checklist from docs/SOP.md.

## Checklist

1. **Build**: `pnpm turbo build` passes
2. **Tests**: `pnpm turbo test` passes, new tests for new code
3. **Types**: `pnpm turbo typecheck` passes, no `any`
4. **Format**: `pnpm format:check` passes
5. **Exports**: new functions re-exported from index.ts, subpath in package.json
6. **Changeset**: present for user-facing changes
7. **API consistency**: async, Graph first arg, typed options, typed result
8. **No console.log**: in library code
9. **Commit messages**: follow `<type>(<scope>): <desc>` convention
10. **BINDINGS.md**: updated if this is a BWU PR
