---
name: release-check
description: "Pre-release validation. Run before tagging a release. Checks build, tests, exports, bundle sizes, package.json fields."
---

# /release-check

Pre-release validation checklist.

## Steps

1. `pnpm turbo build` — all packages build
2. `pnpm turbo test` — all tests pass
3. `pnpm turbo typecheck` — no type errors
4. `pnpm format:check` — formatting OK
5. **Verify exports**: each package's `dist/index.js` exists
6. **Verify package.json fields**: name, version, license, exports, files, sideEffects
7. **Check BINDINGS.md**: no `wip` status items (all should be `done` or `todo`)
8. **Changeset status**: `pnpm changeset status` — pending changesets listed
9. Report: which packages will be published, at what version
