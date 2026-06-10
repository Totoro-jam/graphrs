# @graphrs/operators

Graph transformation and set operations. Combine, transform, and extract subsets of graphs.

```bash
npm install @graphrs/operators
```

## Set Operations

Combine two graphs using set-theoretic operations. Both input graphs must have the same directedness.

### `union(g1, g2)`

Graph union — combines all nodes and edges from both graphs into a single graph.

```typescript
import { Graph } from '@graphrs/core';
import { union } from '@graphrs/operators';

const g1 = Graph.fromEdges([[0, 1], [1, 2]]);
const g2 = Graph.fromEdges([[2, 3], [3, 4]]);

const merged = await union(g1, g2);
console.log(merged.edgeCount()); // 4 — all edges from both graphs
```

**Returns:** `Promise<Graph>`

### `intersection(g1, g2)`

Graph intersection — keeps only edges that exist in both graphs.

```typescript
import { Graph } from '@graphrs/core';
import { intersection } from '@graphrs/operators';

const g1 = Graph.fromEdges([[0, 1], [1, 2], [2, 3]]);
const g2 = Graph.fromEdges([[1, 2], [2, 3], [3, 4]]);

const common = await intersection(g1, g2);
console.log(common.edgeCount()); // 2 — edges [1,2] and [2,3]
```

**Returns:** `Promise<Graph>`

### `difference(g1, g2)`

Graph difference — edges in `g1` that are not in `g2`.

```typescript
import { Graph } from '@graphrs/core';
import { difference } from '@graphrs/operators';

const g1 = Graph.fromEdges([[0, 1], [1, 2], [2, 3]]);
const g2 = Graph.fromEdges([[1, 2], [2, 3], [3, 4]]);

const diff = await difference(g1, g2);
console.log(diff.edgeCount()); // 1 — only edge [0,1]
```

**Returns:** `Promise<Graph>`

## Transforms

Modify graph structure while preserving the underlying network.

### `simplify(graph)`

Remove self-loops and collapse multi-edges into single edges. Essential for cleaning real-world graph data.

```typescript
import { simplify } from '@graphrs/operators';

const cleaned = await simplify(graph);
```

**Returns:** `Promise<Graph>`

### `reverse(graph)`

Reverse all edge directions. Only meaningful for directed graphs — turns every edge A→B into B→A.

```typescript
import { Graph } from '@graphrs/core';
import { reverse } from '@graphrs/operators';

const g = Graph.fromEdges([[0, 1], [1, 2]], { directed: true });
const rev = await reverse(g);
// Now edges are: 1→0, 2→1
```

**Returns:** `Promise<Graph>`

### `toDirected(graph)`

Convert an undirected graph to directed by replacing each undirected edge with two directed edges (one in each direction).

```typescript
import { Graph } from '@graphrs/core';
import { toDirected } from '@graphrs/operators';

const g = Graph.fromEdges([[0, 1], [1, 2]]); // undirected
const directed = await toDirected(g);
console.log(directed.edgeCount()); // 4 (each edge becomes two)
```

**Returns:** `Promise<Graph>`

### `toUndirected(graph)`

Convert a directed graph to undirected by dropping edge directions.

```typescript
import { Graph } from '@graphrs/core';
import { toUndirected } from '@graphrs/operators';

const g = Graph.fromEdges([[0, 1], [1, 2]], { directed: true });
const undirected = await toUndirected(g);
console.log(undirected.directed); // false
```

**Returns:** `Promise<Graph>`

## Subgraph Operations

### `inducedSubgraph(graph, nodeIds)`

Extract the induced subgraph for given node IDs — keeps all edges between the selected nodes.

```typescript
import { Graph } from '@graphrs/core';
import { inducedSubgraph } from '@graphrs/operators';

const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 3], [3, 4],
]);

const sub = await inducedSubgraph(graph, [1, 2, 3]);
console.log(sub.nodeCount()); // 3
console.log(sub.edgeCount()); // 2 — edges [1,2] and [2,3]
```

**Returns:** `Promise<Graph>`

### `complement(graph)`

Graph complement — creates a graph with edges between every pair of nodes that are *not* connected in the original graph. Edges in the original become non-edges and vice versa.

```typescript
import { Graph } from '@graphrs/core';
import { complement } from '@graphrs/operators';

// Path: 0-1-2
const g = Graph.fromEdges([[0, 1], [1, 2]]);
const comp = await complement(g);
// Complement has edge [0,2] — the missing connection
```

**Returns:** `Promise<Graph>`

## Complete Example

Clean and transform a real-world network:

```typescript
import { Graph } from '@graphrs/core';
import {
  simplify, union, inducedSubgraph, complement,
} from '@graphrs/operators';
import { louvain } from '@graphrs/community';

// Merge data from two sources
const socialGraph = Graph.fromEdges([[0,1],[1,2],[2,0]]);
const workGraph = Graph.fromEdges([[2,3],[3,4],[4,2]]);
const combined = await union(socialGraph, workGraph);

// Clean up
const cleaned = await simplify(combined);

// Detect communities, then extract one
const communities = await louvain(cleaned);
const community0Nodes = cleaned.nodes().filter(
  (_, i) => communities.membership[i] === 0,
);
const subgraph = await inducedSubgraph(cleaned, community0Nodes);
console.log(`Community 0: ${subgraph.nodeCount()} nodes, ${subgraph.edgeCount()} edges`);
```

## API Summary

| Function | Signature | Returns | Description |
|----------|-----------|---------|-------------|
| `union` | `(g1, g2)` | `Promise<Graph>` | Combine all edges from both graphs |
| `intersection` | `(g1, g2)` | `Promise<Graph>` | Edges common to both graphs |
| `difference` | `(g1, g2)` | `Promise<Graph>` | Edges in g1 but not g2 |
| `simplify` | `(graph)` | `Promise<Graph>` | Remove self-loops and multi-edges |
| `reverse` | `(graph)` | `Promise<Graph>` | Reverse all edge directions |
| `toDirected` | `(graph)` | `Promise<Graph>` | Undirected → directed |
| `toUndirected` | `(graph)` | `Promise<Graph>` | Directed → undirected |
| `inducedSubgraph` | `(graph, nodeIds)` | `Promise<Graph>` | Extract subgraph by node IDs |
| `complement` | `(graph)` | `Promise<Graph>` | Invert edge presence |

All functions return a **new** `Graph` — the input graph is never mutated.
