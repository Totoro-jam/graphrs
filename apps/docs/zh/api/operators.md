# @graphrs/operators

图变换和集合运算。合并、转换和提取图的子集。

```bash
npm install @graphrs/operators
```

## 集合运算

使用集合论运算合并两个图。两个输入图必须具有相同的有向性。

### `union(g1, g2)`

图的并集 —— 将两个图的所有节点和边合并为一个图。

```typescript
import { Graph } from '@graphrs/core';
import { union } from '@graphrs/operators';

const g1 = Graph.fromEdges([[0, 1], [1, 2]]);
const g2 = Graph.fromEdges([[2, 3], [3, 4]]);

const merged = await union(g1, g2);
console.log(merged.edgeCount()); // 4 — 两个图的所有边
```

**返回值：** `Promise<Graph>`

### `intersection(g1, g2)`

图的交集 —— 只保留两个图中共有的边。

```typescript
import { Graph } from '@graphrs/core';
import { intersection } from '@graphrs/operators';

const g1 = Graph.fromEdges([[0, 1], [1, 2], [2, 3]]);
const g2 = Graph.fromEdges([[1, 2], [2, 3], [3, 4]]);

const common = await intersection(g1, g2);
console.log(common.edgeCount()); // 2 — 边 [1,2] 和 [2,3]
```

**返回值：** `Promise<Graph>`

### `difference(g1, g2)`

图的差集 —— `g1` 中有但 `g2` 中没有的边。

```typescript
import { Graph } from '@graphrs/core';
import { difference } from '@graphrs/operators';

const g1 = Graph.fromEdges([[0, 1], [1, 2], [2, 3]]);
const g2 = Graph.fromEdges([[1, 2], [2, 3], [3, 4]]);

const diff = await difference(g1, g2);
console.log(diff.edgeCount()); // 1 — 只有边 [0,1]
```

**返回值：** `Promise<Graph>`

## 变换

在保持底层网络的同时修改图结构。

### `simplify(graph)`

移除自环并将多重边合并为单边。清洗真实世界图数据的必备操作。

```typescript
import { simplify } from '@graphrs/operators';

const cleaned = await simplify(graph);
```

**返回值：** `Promise<Graph>`

### `reverse(graph)`

反转所有边的方向。仅对有向图有意义 —— 将每条边 A→B 变为 B→A。

```typescript
import { Graph } from '@graphrs/core';
import { reverse } from '@graphrs/operators';

const g = Graph.fromEdges([[0, 1], [1, 2]], { directed: true });
const rev = await reverse(g);
// 现在边为: 1→0, 2→1
```

**返回值：** `Promise<Graph>`

### `toDirected(graph)`

将无向图转换为有向图，将每条无向边替换为两条有向边（每个方向各一条）。

```typescript
import { Graph } from '@graphrs/core';
import { toDirected } from '@graphrs/operators';

const g = Graph.fromEdges([[0, 1], [1, 2]]); // 无向
const directed = await toDirected(g);
console.log(directed.edgeCount()); // 4（每条边变两条）
```

**返回值：** `Promise<Graph>`

### `toUndirected(graph)`

将有向图转换为无向图，丢弃边的方向。

```typescript
import { Graph } from '@graphrs/core';
import { toUndirected } from '@graphrs/operators';

const g = Graph.fromEdges([[0, 1], [1, 2]], { directed: true });
const undirected = await toUndirected(g);
console.log(undirected.directed); // false
```

**返回值：** `Promise<Graph>`

## 子图运算

### `inducedSubgraph(graph, nodeIds)`

提取给定节点 ID 的导出子图 —— 保留所选节点之间的所有边。

```typescript
import { Graph } from '@graphrs/core';
import { inducedSubgraph } from '@graphrs/operators';

const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 3], [3, 4],
]);

const sub = await inducedSubgraph(graph, [1, 2, 3]);
console.log(sub.nodeCount()); // 3
console.log(sub.edgeCount()); // 2 — 边 [1,2] 和 [2,3]
```

**返回值：** `Promise<Graph>`

### `complement(graph)`

图的补图 —— 创建一个在原图中*未连接*的每对节点之间有边的图。原来的边变为非边，反之亦然。

```typescript
import { Graph } from '@graphrs/core';
import { complement } from '@graphrs/operators';

// 路径图: 0-1-2
const g = Graph.fromEdges([[0, 1], [1, 2]]);
const comp = await complement(g);
// 补图有边 [0,2] — 缺失的连接
```

**返回值：** `Promise<Graph>`

## 完整示例

清洗和转换真实世界的网络：

```typescript
import { Graph } from '@graphrs/core';
import {
  simplify, union, inducedSubgraph, complement,
} from '@graphrs/operators';
import { louvain } from '@graphrs/community';

// 合并两个来源的数据
const socialGraph = Graph.fromEdges([[0,1],[1,2],[2,0]]);
const workGraph = Graph.fromEdges([[2,3],[3,4],[4,2]]);
const combined = await union(socialGraph, workGraph);

// 清洗数据
const cleaned = await simplify(combined);

// 检测社区，然后提取其中一个
const communities = await louvain(cleaned);
const community0Nodes = cleaned.nodes().filter(
  (_, i) => communities.membership[i] === 0,
);
const subgraph = await inducedSubgraph(cleaned, community0Nodes);
console.log(`社区 0: ${subgraph.nodeCount()} 个节点, ${subgraph.edgeCount()} 条边`);
```

## API 总结

| 函数              | 签名                  | 返回值          | 说明                     |
| ----------------- | --------------------- | --------------- | ------------------------ |
| `union`           | `(g1, g2)`            | `Promise<Graph>` | 合并两个图的所有边       |
| `intersection`    | `(g1, g2)`            | `Promise<Graph>` | 两个图共有的边           |
| `difference`      | `(g1, g2)`            | `Promise<Graph>` | g1 中有但 g2 中没有的边  |
| `simplify`        | `(graph)`             | `Promise<Graph>` | 移除自环和多重边         |
| `reverse`         | `(graph)`             | `Promise<Graph>` | 反转所有边方向           |
| `toDirected`      | `(graph)`             | `Promise<Graph>` | 无向 → 有向              |
| `toUndirected`    | `(graph)`             | `Promise<Graph>` | 有向 → 无向              |
| `inducedSubgraph` | `(graph, nodeIds)`    | `Promise<Graph>` | 按节点 ID 提取子图       |
| `complement`      | `(graph)`             | `Promise<Graph>` | 反转边的存在性           |

所有函数返回**新的** `Graph` —— 输入图不会被修改。
