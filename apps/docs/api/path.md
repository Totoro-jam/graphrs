# @graphrs/path

Shortest path and graph traversal algorithms.

```bash
npm install @graphrs/path
```

## Functions

### `dijkstra(graph, options?)`

Dijkstra's algorithm — shortest path in graphs with non-negative weights.

```typescript
import { dijkstra } from '@graphrs/path';

const result = await dijkstra(graph, { source: 0, target: 5 });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `source` | `number` | required | Start node |
| `target` | `number` | required | End node |

**Returns**: `Promise<PathResult>`

### `bellmanFord(graph, options?)`

Bellman-Ford algorithm — handles negative edge weights, detects negative cycles.

```typescript
import { bellmanFord } from '@graphrs/path';

const result = await bellmanFord(graph, { source: 0, target: 5 });
```

### `bfs(graph, options?)`

Breadth-first search — traversal and shortest path in unweighted graphs.

```typescript
import { bfs } from '@graphrs/path';

const result = await bfs(graph, { source: 0 });
// result: BfsResult { order: number[], distances: number[] }
```

### `dfs(graph, options?)`

Depth-first search — traversal with discovery/finish times.

```typescript
import { dfs } from '@graphrs/path';

const result = await dfs(graph, { source: 0 });
// result: DfsResult { order: number[] }
```

### `allPairsShortestPaths(graph, options?)`

Compute shortest paths between all pairs of nodes.

```typescript
import { allPairsShortestPaths } from '@graphrs/path';

const result = await allPairsShortestPaths(graph);
```

## Result Types

```typescript
interface PathResult {
  path: number[];     // node IDs along the shortest path
  distance: number;   // total path distance
}

interface BfsResult {
  order: number[];     // BFS visit order
  distances: number[]; // distance from source per node
}

interface DfsResult {
  order: number[];     // DFS visit order
}
```

## Subpath Imports

```typescript
import { dijkstra } from '@graphrs/path/dijkstra';
import { bfs } from '@graphrs/path/bfs';
import { dfs } from '@graphrs/path/dfs';
import { bellmanFord } from '@graphrs/path/bellman-ford';
import { allPairsShortestPaths } from '@graphrs/path/all-pairs';
```
