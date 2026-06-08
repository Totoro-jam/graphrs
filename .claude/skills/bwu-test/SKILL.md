---
name: bwu-test
description: "Write comprehensive tests for a BWU binding. Use after /bwu-implement completes."
---

# /bwu-test <package> <algorithm>

Step 3 of the BWU SOP: write tests.

## Workflow

### 1. Create test file

`packages/<package>/src/__tests__/<algorithm>.test.ts`

### 2. Write tests

Categories:
- **Basic**: known graph → expected result (e.g., Karate club → 2 communities)
- **Edge cases**: empty graph, single node, disconnected graph, self-loops
- **Properties**: structural invariants (e.g., membership array length = nodeCount)
- **Options**: test each option parameter has an effect

### 3. Cross-check (if feasible)

Compare results against python-igraph for the same input graph.
Document the expected values as constants in the test.

### 4. Run

`pnpm turbo test` — all tests pass.

### 5. Update tracking

BINDINGS.md: status → `test`
