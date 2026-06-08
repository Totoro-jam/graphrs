---
name: bwu-implement
description: "Implement the WASM glue for a BWU. Replaces the stub with working marshalling code. Use after /bwu-start completes."
---

# /bwu-implement <package> <algorithm>

Step 2 of the BWU SOP: replace the stub with working WASM bridge code.

## Pre-checks

- BWU must be in status `wip` (stub compiles)
- WASM binary must be available in `packages/core/wasm/`

## Workflow

### 1. Read the WASM export

Read the `#[wasm_bindgen]` function in the WASM crate source.
Understand the input format (JSON string? typed arrays?) and output format.

### 2. Write the marshalling code

Replace the `throw` stub with:
1. `const wasm = await getWasm();`
2. Marshal graph data to WASM format (edges, weights, options)
3. Call the WASM export
4. Parse the result (typically JSON.parse of a returned string)
5. Return typed result object

### 3. Build check

Run `pnpm turbo build` — must succeed.

### 4. Smoke test

Run existing tests: `pnpm turbo test` — must not regress.

### 5. Hand off

> Implementation landed. Next: `/bwu-test <package> <algorithm>`
