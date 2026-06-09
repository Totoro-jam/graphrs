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

// 用 graphrs 构建图
const graph = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 0], // 集群 A
  [3, 4],
  [4, 5],
  [5, 3], // 集群 B
  [2, 3], // 桥接边
]);

// 运行社区检测
const communities = await louvain(graph);

// 计算布局
const layout = await layoutFR(graph);

// 转换为 G6 格式（包含坐标位置）
const data = graph.toG6Format(layout);

// 按社区着色节点
const colors = ['#5B8DEF', '#F5A623', '#7ED321', '#D0021B'];
data.nodes.forEach((node, i) => {
  node.style = {
    fill: colors[communities.membership[i]! % colors.length],
  };
});

// 用 G6 渲染
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

// 创建社交网络
const graph = new Graph();
graph.addNode(0, { name: 'Alice' });
graph.addNode(1, { name: 'Bob' });
graph.addNode(2, { name: 'Carol' });
graph.addEdge(0, 1, { weight: 3 });
graph.addEdge(1, 2, { weight: 1 });
graph.addEdge(0, 2, { weight: 2 });

// 计算重要性和社区
const pr = await pagerank(graph);
const comm = await louvain(graph);

// 用分析结果构建 G6 数据
const data = graph.toG6Format();
data.nodes.forEach((node, i) => {
  node.style = {
    size: 20 + pr.scores[i]! * 100, // 按重要性设置大小
  };
});
```
