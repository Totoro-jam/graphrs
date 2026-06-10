# @graphrs/path

Shortest path and graph traversal algorithms. Find optimal routes, explore graph structure, and compute distance matrices.

```bash
npm install @graphrs/path
```

## Shortest Path

### `dijkstra(graph, source, target, options?)`

Dijkstra's algorithm — finds the shortest path between two nodes in graphs with non-negative edge weights. The most common shortest-path algorithm for weighted graphs.

```typescript
import { Graph } from '@graphrs/core';
import { dijkstra } from '@graphrs/path';

const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 3], [0, 3],
]);

const result = await dijkstra(graph, 0, 3);
console.log(result.distance); // shortest distance from 0 to 3
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `graph` | `Graph` | Input graph |
| `source` | `number` | Start node ID |
| `target` | `number` | End node ID |
| `options` | `DijkstraOptions` | Optional settings |

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `weighted` | `boolean` | `true` | Use edge weights (set `false` for unit weights) |

**Returns:** `Promise<PathResult>`

### `bellmanFord(graph, source, target)`

Bellman-Ford algorithm — handles negative edge weights and detects negative cycles. Slower than Dijkstra but more general.

```typescript
import { bellmanFord } from '@graphrs/path';

const result = await bellmanFord(graph, 0, 5);
console.log(result.distance); // may be negative with negative weights
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `graph` | `Graph` | Input graph |
| `source` | `number` | Start node ID |
| `target` | `number` | End node ID |

**Returns:** `Promise<PathResult>`

::: tip When to use which
Use **Dijkstra** for most cases — it's faster (O(E log V)). Use **Bellman-Ford** only when edges can have negative weights (O(VE)).
:::

## Graph Traversal

### `bfs(graph, source)`

Breadth-first search — visits nodes layer by layer, computing shortest distances in unweighted graphs.

```typescript
import { Graph } from '@graphrs/core';
import { bfs } from '@graphrs/path';

const graph = Graph.fromEdges([
  [0, 1], [0, 2], [1, 3], [2, 3], [3, 4],
]);

const result = await bfs(graph, 0);
console.log(result.order);     // [0, 1, 2, 3, 4] — visit order
console.log(result.distances); // [0, 1, 1, 2, 3] — hop count from source
console.log(result.parents);   // parent node in BFS tree
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `graph` | `Graph` | Input graph |
| `source` | `number` | Start node ID |

**Returns:** `Promise<BfsResult>`

### `dfs(graph, source)`

Depth-first search — explores as far as possible along each branch before backtracking. Useful for topological sorting, cycle detection, and connected components.

```typescript
import { Graph } from '@graphrs/core';
import { dfs } from '@graphrs/path';

const graph = Graph.fromEdges([
  [0, 1], [0, 2], [1, 3], [2, 3], [3, 4],
]);

const result = await dfs(graph, 0);
console.log(result.order);   // DFS visit order
console.log(result.parents); // parent node in DFS tree
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `graph` | `Graph` | Input graph |
| `source` | `number` | Start node ID |

**Returns:** `Promise<DfsResult>`

## All-Pairs Shortest Paths

### `allPairsShortestPaths(graph, options?)`

Compute shortest distances between every pair of nodes using the Floyd-Warshall algorithm. Returns a distance matrix.

```typescript
import { Graph } from '@graphrs/core';
import { allPairsShortestPaths } from '@graphrs/path';

const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 3],
]);

const matrix = await allPairsShortestPaths(graph);
console.log(matrix[0]![3]); // distance from node 0 to node 3
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `graph` | `Graph` | Input graph |
| `options` | `AllPairsOptions` | Optional settings |

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `weighted` | `boolean` | `true` | Use edge weights |

**Returns:** `Promise<number[][]>` — distance matrix where `matrix[i][j]` is the shortest distance from node `i` to node `j`. `Infinity` if no path exists.

## Result Types

```typescript
interface PathResult {
  path: number[];     // node IDs along the shortest path
  distance: number;   // total path distance (Infinity if unreachable)
}

interface BfsResult {
  order: number[];     // BFS visit order
  distances: number[]; // distance from source per node (hop count)
  parents: number[];   // parent node in BFS tree
}

interface DfsResult {
  order: number[];     // DFS visit order
  parents: number[];   // parent node in DFS tree
}
```

## Complete Example

Combine traversal and shortest paths for route analysis:

```typescript
import { Graph } from '@graphrs/core';
import { dijkstra, bfs, allPairsShortestPaths } from '@graphrs/path';

const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 2], [1, 3],
]);

// Point-to-point shortest path
const route = await dijkstra(graph, 0, 4);
console.log(`Distance 0→4: ${route.distance}`);

// Explore reachability from a node
const reachable = await bfs(graph, 0);
console.log(`Reachable from 0:`, reachable.order);

// Full distance matrix
const matrix = await allPairsShortestPaths(graph);
const farthestPair = { from: 0, to: 0, dist: 0 };
for (let i = 0; i < matrix.length; i++) {
  for (let j = 0; j < matrix[i]!.length; j++) {
    if (matrix[i]![j]! > farthestPair.dist && matrix[i]![j]! < Infinity) {
      farthestPair.from = i;
      farthestPair.to = j;
      farthestPair.dist = matrix[i]![j]!;
    }
  }
}
console.log(`Diameter: ${farthestPair.dist} (${farthestPair.from}→${farthestPair.to})`);
```

## API Summary

| Function | Signature | Returns | Description |
|----------|-----------|---------|-------------|
| `dijkstra` | `(graph, source, target, options?)` | `Promise<PathResult>` | Shortest path (non-negative weights) |
| `bellmanFord` | `(graph, source, target)` | `Promise<PathResult>` | Shortest path (allows negative weights) |
| `bfs` | `(graph, source)` | `Promise<BfsResult>` | Breadth-first search |
| `dfs` | `(graph, source)` | `Promise<DfsResult>` | Depth-first search |
| `allPairsShortestPaths` | `(graph, options?)` | `Promise<number[][]>` | All-pairs distance matrix |

## Subpath Imports

```typescript
import { dijkstra } from '@graphrs/path/dijkstra';
import { bellmanFord } from '@graphrs/path/bellman-ford';
import { bfs } from '@graphrs/path/bfs';
import { dfs } from '@graphrs/path/dfs';
import { allPairsShortestPaths } from '@graphrs/path/all-pairs';
```
