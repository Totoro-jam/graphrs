# CLAUDE.md — @graphrs project instructions

## Project at a glance

- **Goal**: Modular, tree-shakable TypeScript graph library powered by Rust/WASM.
  400+ algorithms at native speed. Browser + Node.js. MIT licensed wrappers,
  GPL-2.0 WASM binary.
- **Repo**: `github.com/Totoro-jam/graphrs`
- **WASM source**: `github.com/Totoro-jam/rust-igraph` (crate `igraph-wasm`)
- **Plan**: [docs/plans/GRAPHRS_NPM_PLAN.md](docs/plans/GRAPHRS_NPM_PLAN.md) +
  [SUPPLEMENT](docs/plans/GRAPHRS_NPM_PLAN_SUPPLEMENT.md)
- **SOP**: [docs/SOP.md](docs/SOP.md)
- **Binding tracker**: [docs/tracking/BINDINGS.md](docs/tracking/BINDINGS.md)

## Hard constraints — never violate

1. **No `any` types** in library code. Tests may use them sparingly.
2. **No `console.log`** in library code. Use `throw new GraphError(...)`.
3. **All algorithm functions are `async`** — WASM init is async.
4. **First argument is always `Graph`**, second is optional typed options object.
5. **Every package has `"sideEffects": false`** and ESM subpath exports.
6. **MIT license for TS code; GPL-2.0 notice for bundled .wasm binary.**
7. **Comments are sparse**: only when the *why* is non-obvious.
8. **All code, comments, identifiers in English.**
9. **Don't write secrets/tokens** to any tracked file.

## Package structure

```
packages/
  core/        — Graph class, WASM loader, types, errors
  community/   — Community detection (louvain, leiden, infomap, ...)
  centrality/  — Centrality measures (pagerank, betweenness, ...)
  path/        — Shortest paths, traversal (dijkstra, bfs, dfs, ...)
  layout/      — Spatial layout algorithms (FR, KK, sugiyama, ...)
  generators/  — Graph generators (ER, barabasi-albert, ...)
  io/          — Import/export (GraphML, GML, DOT, edgelist, Pajek)
  operators/   — Graph transforms (union, simplify, reverse, ...)
  flow/        — Network flow & connectivity (max-flow, min-cut, ...)
  isomorphism/ — Structural matching (VF2, canonical, automorphism)
```

## BWU workflow (Binding Work Unit)

Every WASM binding goes through the 4-step BWU SOP:

```
/bwu-start     <package> <algorithm>   # Recon + interface + skeleton
/bwu-implement <package> <algorithm>   # Write WASM glue code
/bwu-test      <package> <algorithm>   # Unit tests + edge cases
/bwu-finish    <package> <algorithm>   # Exports, changeset, PR description
```

Tracked in `docs/tracking/BINDINGS.md`.

## Commands

```bash
pnpm install                    # install all dependencies
pnpm turbo build                # build all packages
pnpm turbo test                 # run all tests
pnpm turbo typecheck            # typecheck all packages
pnpm format:check               # check formatting
pnpm format                     # fix formatting
pnpm changeset                  # add a changeset
./tools/build-wasm.sh [path]    # build WASM from rust-igraph
```

## Git conventions

- Commit: `<type>(<scope>): <description>`
  - types: `feat / fix / test / docs / refactor / perf / chore / ci`
  - scope: package name (`core`, `community`, ...) or `repo`
- Branch: `feat/<package>/<description>`, `fix/<package>/<description>`
- Author: `Totoro-jam <moqiuchen66@gmail.com>`

## API pattern

```typescript
// Every algorithm wrapper follows this shape:
import { getWasm, type Graph, type SomeResult } from '@graphrs/core';

export interface SomeOptions { /* typed options */ }

export async function someAlgorithm(
  graph: Graph,
  options?: SomeOptions,
): Promise<SomeResult> {
  const wasm = await getWasm();
  // marshal graph data → WASM → parse result
  return result;
}
```

## When in doubt

1. Check [docs/plans/GRAPHRS_NPM_PLAN.md](docs/plans/GRAPHRS_NPM_PLAN.md)
2. Check [docs/SOP.md](docs/SOP.md)
3. Look at `@graphrs/core` as the reference implementation
4. Ask the user before introducing architectural changes
