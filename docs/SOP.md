# @graphrs Standard Operating Procedures

This is the single source of truth for all workflows. Update this document
when a process fails, a step is unnecessary, or a new pattern emerges.
Every SOP update is a PR: `chore(repo): update SOP — <reason>`.

---

## 1. PR Workflow

### 1.1 Branch Naming

```
feat/<package>/<description>     # new feature
fix/<package>/<description>      # bug fix
chore/<description>              # maintenance
docs/<description>               # documentation
ci/<description>                 # CI/CD changes
```

### 1.2 Commit Messages

Format: `<type>(<scope>): <description>`

- **type**: `feat`, `fix`, `test`, `docs`, `refactor`, `perf`, `chore`, `ci`
- **scope**: package name (`core`, `community`, `layout`, ...) or `repo`

Examples:
```
feat(community): wire louvain WASM binding
fix(core): handle empty graph in wasm-loader
test(centrality): add pagerank edge cases
chore(repo): update SOP — add bundle size check
```

### 1.3 PR Checklist

Every PR must pass before merge:

- [ ] `pnpm turbo build` passes
- [ ] `pnpm turbo test` passes
- [ ] `pnpm turbo typecheck` passes
- [ ] `pnpm format:check` passes
- [ ] New exports added to `package.json` subpath exports (if applicable)
- [ ] Changeset added (`pnpm changeset`) for user-facing changes
- [ ] No `any` types introduced
- [ ] No `console.log` in library code
- [ ] Bundle size within budget (core JS < 5KB gzip, algorithm pkgs < 2KB gzip)

### 1.4 Review Requirements

- CI must pass
- Human review required for: API changes, new packages, SOP changes

---

## 2. BWU — Binding Work Unit

Each WASM binding follows a 4-step lifecycle. Tracked in
`docs/tracking/BINDINGS.md`.

### Step 1: Start (`/bwu-start`)

1. Read WASM crate source for the target function export
2. Draft TypeScript interface (options type + result type)
3. Present interface to user for approval
4. Write stub file with `throw new Error('Not yet implemented')`
5. Update BINDINGS.md: status → `wip`

**Gate**: Interface approved by user.

### Step 2: Implement (`/bwu-implement`)

1. Read approved interface and WASM export signature
2. Write marshalling code (JS objects ↔ WASM)
3. `pnpm turbo build` must succeed
4. Existing tests must pass

**Gate**: Build passes.

### Step 3: Test (`/bwu-test`)

1. Unit tests — known inputs → expected outputs
2. Edge cases — empty graph, single node, disconnected components
3. Property tests where applicable (e.g., membership covers all nodes)
4. Cross-check against python-igraph for same input if feasible

**Gate**: All tests pass.

### Step 4: Finish (`/bwu-finish`)

1. Function re-exported from `index.ts`
2. Subpath export in `package.json`
3. BINDINGS.md status → `done`
4. Changeset added
5. PR description generated

**Gate**: PR ready for review.

### BWU Status Values

| Status | Meaning |
|--------|---------|
| `todo` | Not started |
| `wip` | Skeleton written, implementation in progress |
| `test` | Implemented, tests being written |
| `review` | PR open |
| `done` | Merged to main |
| `blocked` | Waiting on prerequisite |

---

## 3. Release Process

1. All PRs merged to `main`
2. Run `/release-check` — build, test, verify exports, check bundle sizes
3. `pnpm changeset version` — bump versions, generate changelogs
4. Commit: `chore(repo): version packages`
5. Tag: `git tag v<version>`
6. Push tag → triggers `release.yml` → builds WASM → publishes to npm
7. Verify packages on npmjs.com

### Canary Release

For testing before a full release:
- Trigger `canary.yml` workflow manually via GitHub Actions
- Publishes as `0.0.0-canary.<sha>` with `--tag canary`
- Install: `pnpm add @graphrs/core@canary`

---

## 4. Code Quality Standards

### 4.1 TypeScript

- Strict mode enabled
- No `any` in library code
- All public functions have JSDoc with `@param` and `@returns`
- Use `type` imports for types-only imports

### 4.2 API Design

- All algorithm functions are `async`
- First argument: `Graph` instance
- Second argument: optional typed options object
- Return: typed result object with named fields
- Errors: throw `GraphError` with code + message

### 4.3 Package Standards

- `"sideEffects": false` in package.json
- ESM subpath exports for every public module
- `peerDependencies` on `@graphrs/core`
- `"type": "module"` in package.json

---

## 5. Documentation Site

### 5.1 Local Development

```bash
cd apps/docs && pnpm dev    # dev server with HMR
pnpm build                   # production build (validates all pages)
```

### 5.2 Playground Demos

Playground uses Sandpack (`sandpack-vue3`) with `vanilla-ts` template.

**Critical rules** (CI tests enforce these):

1. Entry file must be `/index.ts` (not `/src/main.ts`)
2. Custom `/index.html` must include `<script type="module">` — required
   for `import.meta` support in `@graphrs/core`
3. Never put literal `</script>` inside a Vue SFC `<script>` block — use
   `<\/script>` in strings to avoid the Vue parser closing early
4. Demo code in markdown `<script setup>` must use backtick template strings
   without nested backticks (no `\`` escaping — use string concatenation)

### 5.3 Vue SFC Gotchas

- `</script>` in a template literal breaks the Vue SFC compiler
- Nested backtick template literals in VitePress markdown `<script setup>` break Babel
- Solution: keep demo code in simple backtick strings, use `'` + concatenation inside

### 5.4 Deployment

- Docs deploy automatically on push to `main` (GitHub Pages via `.github/workflows/docs.yml`)
- CI builds docs as part of the test matrix — build failures block the pipeline

---

## 6. CI/CD Troubleshooting

### 6.1 `ERR_PNPM_TARBALL_INTEGRITY`

When npm republishes a package with the same version but different tarball:
1. Run `pnpm install` locally (regenerates lockfile with new hash)
2. Commit `pnpm-lock.yaml`
3. Push

### 6.2 Docs Build Failure

Most common causes:
- Vue SFC parse error (`Invalid end tag`) — check for `</script>` in template strings
- Babel parse error in markdown `<script setup>` — check for nested backtick escaping
- Missing dependency — run `pnpm install` and commit lockfile

### 6.3 Pre-push Validation

Before pushing, run locally:
```bash
pnpm -w format:check             # formatting
pnpm --filter @graphrs/core test -- --run   # unit tests
cd apps/docs && pnpm build        # docs build
```

---

## 7. SOP Evolution

This document is versioned alongside the codebase. When updating:

1. Identify the gap or failure that motivates the change
2. Draft the new/modified rule
3. PR with `chore(repo): update SOP — <reason>`
4. Reference the PR that revealed the gap (if applicable)
