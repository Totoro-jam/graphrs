# @graphrs/isomorphism

Structural matching and symmetry algorithms. Determine whether two graphs have the same structure, find pattern matches within larger graphs, and analyze structural symmetries.

```bash
npm install @graphrs/isomorphism
```

## Graph Isomorphism

### `isIsomorphic(g1, g2)`

Test whether two graphs are isomorphic — structurally identical up to node relabeling. Uses the VF2 algorithm, which is efficient for most practical graph sizes.

```typescript
import { Graph } from '@graphrs/core';
import { isIsomorphic } from '@graphrs/isomorphism';

// These two graphs are isomorphic (same triangle structure)
const g1 = Graph.fromEdges([[0, 1], [1, 2], [2, 0]]);
const g2 = Graph.fromEdges([[5, 6], [6, 7], [7, 5]]);

const result = await isIsomorphic(g1, g2);
console.log(result); // true
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `g1` | `Graph` | First graph |
| `g2` | `Graph` | Second graph |

**Returns:** `Promise<boolean>` — `true` if a bijection exists between the node sets that preserves all edges.

::: tip When to use
Use isomorphism testing to deduplicate graph datasets, check whether two representations encode the same network, or verify that a transformation preserved structure.
:::

## Subgraph Isomorphism

### `subgraphIsomorphic(g1, g2)`

Test whether `g2` contains a subgraph isomorphic to `g1`. This is the pattern matching problem — "does this motif appear in the larger graph?"

```typescript
import { Graph } from '@graphrs/core';
import { subgraphIsomorphic } from '@graphrs/isomorphism';

// Pattern: a triangle
const pattern = Graph.fromEdges([[0, 1], [1, 2], [2, 0]]);

// Host: a larger graph that contains triangles
const host = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0],  // triangle here
  [2, 3], [3, 4],           // path extending out
]);

const found = await subgraphIsomorphic(pattern, host);
console.log(found); // true — the triangle exists within `host`
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `g1` | `Graph` | Pattern graph (the subgraph to search for) |
| `g2` | `Graph` | Host graph (the graph to search within) |

**Returns:** `Promise<boolean>` — `true` if `g1` appears as a subgraph of `g2`.

::: tip When to use
Subgraph isomorphism is fundamental to motif discovery in biological networks, fraud pattern detection in transaction graphs, and template matching in molecular graphs.
:::

## Canonical Form

### `canonicalPermutation(graph)`

Compute a canonical labeling — a permutation that maps node IDs to a canonical ordering. Two isomorphic graphs produce the same canonical form, making this useful as a graph hash or fingerprint.

```typescript
import { Graph } from '@graphrs/core';
import { canonicalPermutation } from '@graphrs/isomorphism';

const graph = Graph.fromEdges([[0, 1], [1, 2], [2, 0]]);
const perm = await canonicalPermutation(graph);
console.log(perm); // e.g. [2, 0, 1] — canonical node reordering
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `graph` | `Graph` | Input graph |

**Returns:** `Promise<number[]>` — permutation array where `perm[i]` is the canonical position of node `i`.

::: tip When to use
Use canonical permutations to build lookup tables for graph databases: compute the canonical form once, then use it as a key for O(1) isomorphism lookups.
:::

## Automorphism Group

### `automorphismGroupSize(graph)`

Compute the size of the automorphism group — the number of distinct ways the graph can be mapped onto itself while preserving all edges. A graph with many symmetries has a large automorphism group.

```typescript
import { Graph } from '@graphrs/core';
import { automorphismGroupSize } from '@graphrs/isomorphism';

// Complete graph K4 — highly symmetric
const k4 = Graph.fromEdges([
  [0, 1], [0, 2], [0, 3],
  [1, 2], [1, 3], [2, 3],
]);
const size = await automorphismGroupSize(k4);
console.log(size); // 24 (= 4! since any permutation of K4 is an automorphism)

// Path graph 0-1-2 — less symmetric
const path = Graph.fromEdges([[0, 1], [1, 2]]);
const pathSize = await automorphismGroupSize(path);
console.log(pathSize); // 2 (only identity and reversal)
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `graph` | `Graph` | Input graph |

**Returns:** `Promise<number>` — the number of automorphisms (self-isomorphisms).

## Complete Example

Analyze a graph's structural properties:

```typescript
import { Graph } from '@graphrs/core';
import {
  isIsomorphic,
  subgraphIsomorphic,
  canonicalPermutation,
  automorphismGroupSize,
} from '@graphrs/isomorphism';

// Two representations of the Petersen graph
const g1 = Graph.fromEdges([
  [0,1],[1,2],[2,3],[3,4],[4,0],
  [0,5],[1,6],[2,7],[3,8],[4,9],
  [5,7],[7,9],[9,6],[6,8],[8,5],
]);

// Check symmetry
const auts = await automorphismGroupSize(g1);
console.log(`Automorphisms: ${auts}`); // 120

// Canonical fingerprint
const perm = await canonicalPermutation(g1);
console.log(`Canonical permutation:`, perm);

// Search for a 5-cycle motif
const cycle5 = Graph.fromEdges([[0,1],[1,2],[2,3],[3,4],[4,0]]);
const hasCycle = await subgraphIsomorphic(cycle5, g1);
console.log(`Contains 5-cycle: ${hasCycle}`); // true
```

## API Summary

| Function | Signature | Returns | Description |
|----------|-----------|---------|-------------|
| `isIsomorphic` | `(g1, g2)` | `Promise<boolean>` | Test structural equivalence |
| `subgraphIsomorphic` | `(pattern, host)` | `Promise<boolean>` | Test pattern containment |
| `canonicalPermutation` | `(graph)` | `Promise<number[]>` | Canonical node ordering |
| `automorphismGroupSize` | `(graph)` | `Promise<number>` | Number of symmetries |
