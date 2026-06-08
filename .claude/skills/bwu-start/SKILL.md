---
name: bwu-start
description: "Bootstrap a new Binding Work Unit. Reads the WASM crate source to identify the export, drafts a TS interface for user approval, writes a stub, updates BINDINGS.md. Use when: 'start BWU ...', 'bind <algorithm>', 'let's implement ...'."
---

# /bwu-start <package> <algorithm>

Steps 1 of the 4-step BWU SOP. Goal: approved interface + compiling stub.

## Workflow

### 1. Locate the WASM export

Read `rust-igraph/crates/igraph-wasm/src/<module>.rs` (the module matches
the package name: community → community.rs, centrality → centrality.rs, etc.).
Find the `#[wasm_bindgen]` export for the target algorithm.

### 2. Draft the TypeScript interface

From the WASM export signature, draft:
- An `Options` interface with all optional parameters
- The return type (use existing types from `@graphrs/core` where possible)
- The async function signature

Show to user. **Wait for explicit approval.**

### 3. Write the stub

Create/update `packages/<package>/src/<algorithm>.ts`:
- Import `getWasm` and types from `@graphrs/core`
- Export the Options interface
- Export the async function with `throw new Error('Not yet implemented')`
- Add re-export to `packages/<package>/src/index.ts`

### 4. Verify

Run `pnpm turbo build` — must succeed.

### 5. Update tracking

In `docs/tracking/BINDINGS.md`: flip status from `todo` to `wip`, add date.

## Anti-patterns

- **Do NOT implement the WASM glue now.** That's `/bwu-implement`.
- **Do NOT design beyond what the WASM export supports.**
- **Do NOT update status until the stub compiles.**
