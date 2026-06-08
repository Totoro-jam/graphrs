# @graphrs Plan Supplement — Engineering Practices, SOP & CI/CD

This document supplements `GRAPHRS_NPM_PLAN.md` with items not covered
in the original plan: npm publish pipeline, AI engineering practices,
SOP standards, and skill definitions.

---

## S1. npm Publish Pipeline (Actionable Setup)

### S1.1 What the Repo Owner Must Configure

Before the publish action can run, the following **manual steps** are required:

1. **Create the npm organization**
   ```bash
   # On npmjs.com → Add Organization → name: "graphrs"
   # Or via CLI:
   npm login
   npm org create graphrs
   ```

2. **Generate an npm Automation token**
   - npmjs.com → Access Tokens → Generate New Token → type: **Automation**
   - Copy the token (starts with `npm_...`)

3. **Add GitHub repository secrets**
   - GitHub → `Totoro-jam/graphrs` → Settings → Secrets and variables → Actions
   - Add secret: `NPM_TOKEN` = the token from step 2

4. **Verify npm scope access**
   ```bash
   npm access ls-packages @graphrs
   ```

### S1.2 Test/Placeholder Publish Strategy

Before the WASM layer is ready, publish placeholder packages at `0.0.1-alpha.0`
so the npm scope is reserved and CI can be validated end-to-end:

- Use `--tag alpha` so `latest` stays clean
- Each package gets `"version": "0.0.1-alpha.0"` initially
- The algorithm stubs throw `Error('Not yet implemented')` — this is fine for
  alpha; consumers know what they're getting
- Changesets manages version bumps after alpha

### S1.3 GitHub Actions — Full CI/CD Matrix

The original plan has a basic `release.yml`. The production setup needs **three
workflows**:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | push to any branch, PR | Lint + typecheck + test + build |
| `release.yml` | push tag `v*` | Build WASM + publish to npm |
| `canary.yml` | manual dispatch | Publish canary (`0.0.0-canary.{sha}`) for testing |

Plus:
- `dependabot.yml` — automated dependency updates
- Branch protection rules: require CI pass before merge to `main`

---

## S2. AI Engineering Practices (Skills & Agents)

### S2.1 Skill Architecture

Adapted from `rust-igraph`'s AWU (Algorithm Work Unit) pattern. In @graphrs,
the equivalent is **BWU — Binding Work Unit**: each WASM binding goes through
a structured SOP.

```
.claude/
├── skills/
│   ├── bwu-start/SKILL.md       # Bootstrap a new Binding Work Unit
│   ├── bwu-implement/SKILL.md   # Implement the TS wrapper + WASM glue
│   ├── bwu-test/SKILL.md        # Write vitest tests + edge cases
│   ├── bwu-finish/SKILL.md      # Docs, exports, changelog, PR description
│   ├── diagnose/SKILL.md        # Debug build/test/WASM issues
│   ├── review-pr/SKILL.md       # Structured PR review checklist
│   └── release-check/SKILL.md   # Pre-release validation
├── agents/
│   ├── wasm-bridge.md           # Specialist: reads WASM exports, generates TS types
│   ├── api-designer.md          # Specialist: designs ergonomic TS APIs
│   └── benchmark-runner.md      # Specialist: runs perf benchmarks, generates tables
└── settings.json
```

### S2.2 Skill Definitions

#### `/bwu-start <package> <algorithm>`

**Purpose**: Bootstrap binding for one algorithm. Steps:
1. Read the WASM crate source (`crates/igraph-wasm/src/<module>.rs`) to
   identify the exported function signature
2. Draft a TypeScript interface (options type + result type)
3. Present to user for approval
4. Write the stub file with `throw new Error('Not yet implemented')`
5. Update tracking in `docs/tracking/BINDINGS.md`

**Source pattern**: Adapted from `rust-igraph /awu-start` — same "recon →
interface → skeleton → track" flow, but for TS-over-WASM instead of Rust-over-C.

#### `/bwu-implement <package> <algorithm>`

**Purpose**: Replace the stub with working WASM glue code. Steps:
1. Read the approved interface and WASM export
2. Write the marshalling code (JS objects ↔ WASM linear memory)
3. Run `pnpm turbo build` — must succeed
4. Run `pnpm turbo test` — existing tests must pass

**Source pattern**: Adapted from `rust-igraph /awu-translate`.

#### `/bwu-test <package> <algorithm>`

**Purpose**: Write comprehensive tests. Steps:
1. Unit tests for the algorithm (known inputs → expected outputs)
2. Edge cases (empty graph, single node, disconnected components)
3. Property tests where applicable (e.g., community membership covers all nodes)
4. Cross-check against python-igraph results for the same input

#### `/bwu-finish <package> <algorithm>`

**Purpose**: Finalize for merge. Steps:
1. Ensure the function is re-exported from `index.ts`
2. Ensure subpath export is in `package.json`
3. Update `docs/tracking/BINDINGS.md` status to `done`
4. Generate PR description with changeset

#### `/diagnose`

**Purpose**: Debug build, test, or WASM loading issues.
**Source pattern**: Direct adaptation of `rust-igraph /diagnose`.

#### `/review-pr`

**Purpose**: Structured code review against the SOP checklist.

#### `/release-check`

**Purpose**: Pre-release validation — build all packages, run all tests,
verify exports, check bundle sizes, validate package.json fields.

### S2.3 Skill Source References

| Skill | Adapted from | Why it's reliable |
|-------|-------------|-------------------|
| BWU lifecycle (`bwu-*`) | `rust-igraph` AWU skills (same author, 100+ AWUs landed) | Battle-tested on 1297-API Rust project |
| `/diagnose` | `rust-igraph /diagnose` | General-purpose debugging skill |
| `/review-pr` | GitHub's own PR review guidelines + Changesets best practices | Industry standard |
| `/release-check` | npm best practices + `publint` tool conventions | npm ecosystem standard |

---

## S3. SOP (Standard Operating Procedures)

### S3.1 Core SOP Document

File: `docs/SOP.md` — the single source of truth for all workflows.

### S3.2 PR Workflow SOP

Every PR must:

1. **Branch naming**: `feat/<package>/<description>`, `fix/<package>/<description>`,
   `chore/<description>`
2. **Commit messages**: `<type>(<scope>): <description>`
   - types: `feat`, `fix`, `test`, `docs`, `refactor`, `perf`, `chore`, `ci`
   - scope: package name (e.g., `core`, `community`, `layout`) or `repo`
3. **PR checklist** (enforced by template):
   - [ ] `pnpm turbo build` passes
   - [ ] `pnpm turbo test` passes
   - [ ] `pnpm turbo typecheck` passes
   - [ ] `pnpm format:check` passes
   - [ ] New exports are added to `package.json` subpath exports
   - [ ] Changeset added (if user-facing change)
   - [ ] No `any` types introduced
   - [ ] No `console.log` in library code
4. **Review requirements**: At least CI passes; human review for API changes

### S3.3 Algorithm Binding SOP (BWU — Binding Work Unit)

Each algorithm binding follows a 4-step SOP:

| Step | Skill | Gate |
|------|-------|------|
| 1. Start | `/bwu-start` | Interface approved by user |
| 2. Implement | `/bwu-implement` | Build + existing tests pass |
| 3. Test | `/bwu-test` | New tests pass, edge cases covered |
| 4. Finish | `/bwu-finish` | PR description ready, changeset added |

Status tracking in `docs/tracking/BINDINGS.md`:
```
| BWU ID | Package | Algorithm | Status | Date |
|--------|---------|-----------|--------|------|
| BWU-COM-001 | community | louvain | todo | — |
| BWU-COM-002 | community | leiden | todo | — |
```

### S3.4 Release SOP

1. All PRs merged to `main`
2. Run `/release-check` skill
3. `pnpm changeset version` — bump versions, generate changelogs
4. Commit version bumps
5. Tag: `git tag v0.x.y`
6. Push tag → triggers `release.yml` → publishes to npm

### S3.5 SOP Evolution

The SOP is a living document. Update it when:
- A process fails or produces a defect → add a check
- A step is consistently unnecessary → remove it
- A new pattern emerges → document it

Every SOP update is a PR with `chore(repo): update SOP — <reason>`.

---

## S4. Tracking

### S4.1 Binding Tracker

File: `docs/tracking/BINDINGS.md` — tracks every algorithm binding's status.
Updated by `/bwu-start` and `/bwu-finish` skills.

### S4.2 Status Values

| Status | Meaning |
|--------|---------|
| `todo` | Not started |
| `wip` | Skeleton written, implementation in progress |
| `test` | Implemented, tests being written |
| `review` | PR open, awaiting review |
| `done` | Merged to main |
| `blocked` | Waiting on prerequisite (WASM export, upstream fix) |

---

## S5. Checklist — Items Missing from Original Plan

| # | Gap | Resolution |
|---|-----|-----------|
| 1 | No CI workflow (only release) | Added `ci.yml` with lint+test+build matrix |
| 2 | No canary/alpha publish strategy | Added `canary.yml` + alpha version strategy |
| 3 | No dependabot | Added `dependabot.yml` |
| 4 | No PR template | Added `.github/pull_request_template.md` |
| 5 | No branch protection guidance | Added in SOP §3.2 |
| 6 | No AI skill definitions | Added full BWU skill architecture (§S2) |
| 7 | No SOP document | Added comprehensive SOP (§S3) |
| 8 | No binding tracker | Added `docs/tracking/BINDINGS.md` (§S4) |
| 9 | No npm org/token setup instructions | Added in §S1.1 |
| 10 | No commit convention | Added in SOP §3.2 |
| 11 | No CLAUDE.md for this repo | Will be created as part of init |
| 12 | No `.github/CODEOWNERS` | Should add |
| 13 | No issue templates | Should add |
