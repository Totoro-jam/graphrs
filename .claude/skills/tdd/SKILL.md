---
name: tdd
description: "Test-driven development for @graphrs. Red-green-refactor loop for WASM bindings and pure-TS code. Use when: 'write tests first', 'TDD this', 'let's do red-green-refactor', or when implementing a new binding and wanting tests to drive the design."
---

# /tdd <package> <feature>

Test-driven development loop adapted for TypeScript WASM bindings.

> Adapted from <https://github.com/mattpocock/skills/tree/main/skills/engineering/tdd>.
> Modified for async WASM APIs and monorepo structure.

## Philosophy

Tests validate **behavior through public interfaces**, not WASM internals.
A good test calls `louvain(graph)` and checks the result shape. A bad test
mocks `getWasm()` internals. If your test breaks when you change marshalling
logic but the output is identical, the test is coupled to implementation.

## Workflow

### 1. Planning

Confirm with the user:
- Which function(s) are we testing?
- What are the critical behaviors? (basic case, edge cases, error cases)
- What are the expected outputs for known inputs?

Design for **vertical slices**: one test → one behavior.

### 2. Tracer Bullet (RED → GREEN)

Write a single test that exercises the end-to-end path:

```typescript
// packages/<package>/src/__tests__/<algo>.test.ts
import { describe, it, expect } from 'vitest';
import { Graph } from '@graphrs/core';
import { louvain } from '../louvain.js';

describe('louvain', () => {
  it('detects two clear communities in a barbell graph', async () => {
    const g = Graph.fromEdges([
      [0,1],[1,2],[2,0],  // cluster A
      [3,4],[4,5],[5,3],  // cluster B
      [2,3],              // bridge
    ]);
    const result = await louvain(g);
    expect(result.clusters).toBe(2);
    expect(result.membership).toHaveLength(g.nodeCount());
    expect(result.modularity).toBeGreaterThan(0);
  });
});
```

Run: `pnpm vitest run packages/<package>` — should be RED.
Implement minimal code to pass — GREEN.

### 3. Incremental Loop

For each remaining behavior, RED → GREEN one test at a time:

- **Edge case**: empty graph → graceful result or clear error
- **Edge case**: single node → membership = [0], clusters = 1
- **Edge case**: disconnected graph → each component is its own community
- **Options test**: `resolution` parameter affects output
- **Property test**: `membership.length === graph.nodeCount()`
- **Property test**: all membership values in `[0, clusters-1]`

Rules:
- Only write enough code to pass the current test
- Don't anticipate future tests
- Each test describes a behavior, not an implementation detail

### 4. Refactor (only when GREEN)

- Extract shared test fixtures
- Clean up the implementation
- Run all tests after each refactor step
- **Never refactor while RED**

## Per-cycle checklist

- [ ] Test describes behavior (not WASM marshalling internals)
- [ ] Test uses only the public API (`import from '@graphrs/...'`)
- [ ] Test would survive a WASM → pure-JS implementation swap
- [ ] Implementation is minimal for the current test set
- [ ] No speculative features added

## Anti-patterns

- **Don't mock `getWasm()`** in unit tests. Either use the real WASM or
  test pure-TS logic (like Graph class) without WASM.
- **Don't write all tests first.** Vertical slices, one at a time.
- **Don't test private `_getEdgePairs()` / `_getWeights()` directly.**
  Test the public algorithm output.
