# AntV G6 集成

[AntV G6](https://g6.antv.antgroup.com/) 是蚂蚁集团出品的图可视化引擎，专为大规模关系数据设计。graphrs 提供了内置的 `toG6Format()` 序列化器。

## 安装

```bash
npm install @graphrs/core @graphrs/community @graphrs/layout @antv/g6
```

## 基本示例

```typescript
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';
import { layoutFR } from '@graphrs/layout';
import { Graph as G6Graph } from '@antv/g6';

// Build a graph with graphrs
const graph = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 0], // cluster A
  [3, 4],
  [4, 5],
  [5, 3], // cluster B
  [2, 3], // bridge
]);

// Run community detection
const communities = await louvain(graph);

// Compute layout
const layout = await layoutFR(graph);

// Convert to G6 format (positions included)
const data = graph.toG6Format(layout);

// Color nodes by community
const colors = ['#5B8DEF', '#F5A623', '#7ED321', '#D0021B'];
data.nodes.forEach((node, i) => {
  node.style = {
    fill: colors[communities.membership[i]! % colors.length],
  };
});

// Render with G6
const g6 = new G6Graph({
  container: 'graph-container',
  width: 800,
  height: 600,
  data,
  node: {
    style: { size: 24 },
  },
  edge: {
    style: { stroke: '#ccc' },
  },
});

g6.render();
```

## 数据格式

`toG6Format()` 产生 G6 所期望的格式：

```typescript
{
  nodes: [
    { id: "0", x: 120.5, y: 80.3, ...nodeData },
    { id: "1", x: 200.1, y: 150.7, ...nodeData },
  ],
  edges: [
    { source: "0", target: "1", ...edgeData },
  ]
}
```

- 节点 `id` 值会被字符串化（G6 要求字符串 ID）
- 当传入 `LayoutResult` 时会包含 `x` 和 `y` 坐标
- 自定义的节点/边数据会展开到每个对象中

## 社交网络分析

```typescript
import { Graph } from '@graphrs/core';
import { pagerank } from '@graphrs/centrality';
import { louvain } from '@graphrs/community';

// Create a social network
const graph = new Graph();
graph.addNode(0, { name: 'Alice' });
graph.addNode(1, { name: 'Bob' });
graph.addNode(2, { name: 'Carol' });
graph.addEdge(0, 1, { weight: 3 });
graph.addEdge(1, 2, { weight: 1 });
graph.addEdge(0, 2, { weight: 2 });

// Compute importance and communities
const pr = await pagerank(graph);
const comm = await louvain(graph);

// Build G6 data with analysis results
const data = graph.toG6Format();
data.nodes.forEach((node, i) => {
  node.style = {
    size: 20 + pr.scores[i]! * 100, // size by importance
  };
});
```
