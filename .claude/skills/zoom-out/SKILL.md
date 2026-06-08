---
name: zoom-out
description: "Pull back from a section of code to give a higher-level map. Use when stuck deep in WASM marshalling, confused about package boundaries, or need perspective on where a binding fits in the overall library. Trigger: 'zoom out', 'where does this fit', 'big picture'."
disable-model-invocation: true
---

Go up a layer of abstraction. Give me a one-screen map covering:

1. **Which BWU is this?** Quote the row from `docs/tracking/BINDINGS.md`
   (id, package, algorithm, status).
2. **Package context** — which other algorithms are in the same package,
   which are `done` vs `todo`. Is there a pattern from the done ones
   to follow?
3. **WASM neighbourhood** — the corresponding module in
   `rust-igraph/crates/igraph-wasm/src/`. Which other exports are in
   the same file? Are there shared data structures the binding needs?
4. **Dependency chain** — does this binding depend on `@graphrs/core`
   types that don't exist yet? Does anything downstream wait for this?
5. **API consistency check** — does the current interface match the
   conventions in CLAUDE.md §API pattern? (async, Graph first, typed
   options, typed result)

Use the project's vocabulary — `BWU`, `getWasm`, `Graph`, `_getEdgePairs`,
package names — not generic terms. Skip implementation details. The output
is for refocusing, not for coding.

> Adapted from <https://github.com/mattpocock/skills/tree/main/skills/engineering/zoom-out>.
