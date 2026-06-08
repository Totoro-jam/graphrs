# @graphrs/path

最短路径和图遍历算法。

```bash
npm install @graphrs/path
```

## 函数

### `dijkstra(graph, options?)`

Dijkstra 算法 —— 在非负权重图中计算最短路径。

```typescript
import { dijkstra } from '@graphrs/path';

const result = await dijkstra(graph, { source: 0, target: 5 });
```

| 选项     | 类型     | 默认值 | 说明     |
| -------- | -------- | ------ | -------- |
| `source` | `number` | 必填   | 起始节点 |
| `target` | `number` | 必填   | 目标节点 |

**返回值**：`Promise<PathResult>`

### `bellmanFord(graph, options?)`

Bellman-Ford 算法 —— 支持负权重边，能检测负环。

```typescript
import { bellmanFord } from '@graphrs/path';

const result = await bellmanFord(graph, { source: 0, target: 5 });
```

### `bfs(graph, options?)`

广度优先搜索 —— 遍历和无权图中的最短路径。

```typescript
import { bfs } from '@graphrs/path';

const result = await bfs(graph, { source: 0 });
// result: BfsResult { order: number[], distances: number[] }
```

### `dfs(graph, options?)`

深度优先搜索 —— 带发现/完成时间的遍历。

```typescript
import { dfs } from '@graphrs/path';

const result = await dfs(graph, { source: 0 });
// result: DfsResult { order: number[] }
```

### `allPairsShortestPaths(graph, options?)`

计算所有节点对之间的最短路径。

```typescript
import { allPairsShortestPaths } from '@graphrs/path';

const result = await allPairsShortestPaths(graph);
```

## 结果类型

```typescript
interface PathResult {
  path: number[]; // node IDs along the shortest path
  distance: number; // total path distance
}

interface BfsResult {
  order: number[]; // BFS visit order
  distances: number[]; // distance from source per node
}

interface DfsResult {
  order: number[]; // DFS visit order
}
```

## 子路径导入

```typescript
import { dijkstra } from '@graphrs/path/dijkstra';
import { bfs } from '@graphrs/path/bfs';
import { dfs } from '@graphrs/path/dfs';
import { bellmanFord } from '@graphrs/path/bellman-ford';
import { allPairsShortestPaths } from '@graphrs/path/all-pairs';
```
