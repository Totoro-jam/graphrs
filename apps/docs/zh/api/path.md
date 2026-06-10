# @graphrs/path

最短路径和图遍历算法。查找最优路线、探索图结构、计算距离矩阵。

```bash
npm install @graphrs/path
```

## 最短路径

### `dijkstra(graph, source, target, options?)`

Dijkstra 算法 —— 在非负权重图中找到两个节点之间的最短路径。加权图最常用的最短路径算法。

```typescript
import { Graph } from '@graphrs/core';
import { dijkstra } from '@graphrs/path';

const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 3], [0, 3],
]);

const result = await dijkstra(graph, 0, 3);
console.log(result.distance); // 从 0 到 3 的最短距离
```

**参数：**

| 参数      | 类型              | 说明         |
| --------- | ----------------- | ------------ |
| `graph`   | `Graph`           | 输入图       |
| `source`  | `number`          | 起始节点 ID  |
| `target`  | `number`          | 目标节点 ID  |
| `options` | `DijkstraOptions` | 可选设置     |

**选项：**

| 选项       | 类型      | 默认值 | 说明                               |
| ---------- | --------- | ------ | ---------------------------------- |
| `weighted` | `boolean` | `true` | 使用边权重（设为 `false` 使用单位权重） |

**返回值：** `Promise<PathResult>`

### `bellmanFord(graph, source, target)`

Bellman-Ford 算法 —— 支持负权重边，能检测负环。比 Dijkstra 慢但更通用。

```typescript
import { bellmanFord } from '@graphrs/path';

const result = await bellmanFord(graph, 0, 5);
console.log(result.distance); // 在有负权重时可能为负值
```

**参数：**

| 参数     | 类型     | 说明        |
| -------- | -------- | ----------- |
| `graph`  | `Graph`  | 输入图      |
| `source` | `number` | 起始节点 ID |
| `target` | `number` | 目标节点 ID |

**返回值：** `Promise<PathResult>`

::: tip 如何选择
大多数情况使用 **Dijkstra** —— 更快 (O(E log V))。仅当边可能有负权重时使用 **Bellman-Ford** (O(VE))。
:::

## 图遍历

### `bfs(graph, source)`

广度优先搜索 —— 逐层访问节点，计算无权图中的最短距离。

```typescript
import { Graph } from '@graphrs/core';
import { bfs } from '@graphrs/path';

const graph = Graph.fromEdges([
  [0, 1], [0, 2], [1, 3], [2, 3], [3, 4],
]);

const result = await bfs(graph, 0);
console.log(result.order);     // [0, 1, 2, 3, 4] — 访问顺序
console.log(result.distances); // [0, 1, 1, 2, 3] — 从源节点的跳数
console.log(result.parents);   // BFS 树中的父节点
```

**参数：**

| 参数     | 类型     | 说明        |
| -------- | -------- | ----------- |
| `graph`  | `Graph`  | 输入图      |
| `source` | `number` | 起始节点 ID |

**返回值：** `Promise<BfsResult>`

### `dfs(graph, source)`

深度优先搜索 —— 沿每个分支尽可能深入地探索，然后回溯。适用于拓扑排序、环检测和连通分量。

```typescript
import { Graph } from '@graphrs/core';
import { dfs } from '@graphrs/path';

const graph = Graph.fromEdges([
  [0, 1], [0, 2], [1, 3], [2, 3], [3, 4],
]);

const result = await dfs(graph, 0);
console.log(result.order);   // DFS 访问顺序
console.log(result.parents); // DFS 树中的父节点
```

**参数：**

| 参数     | 类型     | 说明        |
| -------- | -------- | ----------- |
| `graph`  | `Graph`  | 输入图      |
| `source` | `number` | 起始节点 ID |

**返回值：** `Promise<DfsResult>`

## 全源最短路径

### `allPairsShortestPaths(graph, options?)`

使用 Floyd-Warshall 算法计算每对节点之间的最短距离。返回距离矩阵。

```typescript
import { Graph } from '@graphrs/core';
import { allPairsShortestPaths } from '@graphrs/path';

const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 3],
]);

const matrix = await allPairsShortestPaths(graph);
console.log(matrix[0]![3]); // 节点 0 到节点 3 的距离
```

**参数：**

| 参数      | 类型             | 说明     |
| --------- | ---------------- | -------- |
| `graph`   | `Graph`          | 输入图   |
| `options` | `AllPairsOptions` | 可选设置 |

**选项：**

| 选项       | 类型      | 默认值 | 说明       |
| ---------- | --------- | ------ | ---------- |
| `weighted` | `boolean` | `true` | 使用边权重 |

**返回值：** `Promise<number[][]>` —— 距离矩阵，其中 `matrix[i][j]` 是节点 `i` 到节点 `j` 的最短距离。不可达时为 `Infinity`。

## 结果类型

```typescript
interface PathResult {
  path: number[];     // 最短路径上的节点 ID
  distance: number;   // 总路径距离（不可达时为 Infinity）
}

interface BfsResult {
  order: number[];     // BFS 访问顺序
  distances: number[]; // 每个节点到源节点的距离（跳数）
  parents: number[];   // BFS 树中的父节点
}

interface DfsResult {
  order: number[];     // DFS 访问顺序
  parents: number[];   // DFS 树中的父节点
}
```

## 完整示例

结合遍历和最短路径进行路由分析：

```typescript
import { Graph } from '@graphrs/core';
import { dijkstra, bfs, allPairsShortestPaths } from '@graphrs/path';

const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 2], [1, 3],
]);

// 点对点最短路径
const route = await dijkstra(graph, 0, 4);
console.log(`距离 0→4: ${route.distance}`);

// 从某个节点探索可达性
const reachable = await bfs(graph, 0);
console.log(`从 0 可达的节点:`, reachable.order);

// 完整距离矩阵
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
console.log(`直径: ${farthestPair.dist} (${farthestPair.from}→${farthestPair.to})`);
```

## API 总结

| 函数                     | 签名                                    | 返回值               | 说明                      |
| ------------------------ | --------------------------------------- | -------------------- | ------------------------- |
| `dijkstra`               | `(graph, source, target, options?)`     | `Promise<PathResult>` | 最短路径（非负权重）      |
| `bellmanFord`            | `(graph, source, target)`               | `Promise<PathResult>` | 最短路径（允许负权重）    |
| `bfs`                    | `(graph, source)`                       | `Promise<BfsResult>`  | 广度优先搜索              |
| `dfs`                    | `(graph, source)`                       | `Promise<DfsResult>`  | 深度优先搜索              |
| `allPairsShortestPaths`  | `(graph, options?)`                     | `Promise<number[][]>` | 全源距离矩阵              |

## 子路径导入

```typescript
import { dijkstra } from '@graphrs/path/dijkstra';
import { bellmanFord } from '@graphrs/path/bellman-ford';
import { bfs } from '@graphrs/path/bfs';
import { dfs } from '@graphrs/path/dfs';
import { allPairsShortestPaths } from '@graphrs/path/all-pairs';
```
