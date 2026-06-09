# AntV G6 集成

[AntV G6](https://g6.antv.antgroup.com/) 是蚂蚁集团的图可视化引擎。`@graphrs/g6` 包提供即插即用的集成方案 — 布局引擎、社区检测和中心性分析，直接兼容 G6 5.x 数据格式。

## 安装

```bash
npm install @graphrs/g6 @antv/g6
```

`@graphrs/g6` 已将 `@graphrs/core`、`@graphrs/layout`、`@graphrs/community` 和 `@graphrs/centrality` 作为依赖打包，无需单独安装。

## 快速开始 — 自定义布局

将 graphrs 布局算法注册为 G6 自定义布局，是最快的集成方式。

```typescript
import { Graph } from '@antv/g6';
import { createGraphrsLayout } from '@graphrs/g6';

const graph = new Graph({
  container: 'graph-container',
  width: 800,
  height: 600,
  data: {
    nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
    edges: [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
      { source: 'c', target: 'd' },
      { source: 'd', target: 'a' },
    ],
  },
  layout: createGraphrsLayout({
    algorithm: 'fruchterman-reingold',
    iterations: 500,
    center: [400, 300],
    width: 800,
    height: 600,
  }),
});

graph.render();
```

### 可用布局算法

| 算法 | 键名 | 说明 |
|------|------|------|
| Fruchterman-Reingold | `fruchterman-reingold` | 力导向布局，适用于通用图 |
| Kamada-Kawai | `kamada-kawai` | 能量最小化，中小规模图效果好 |
| Circle | `circle` | 节点排列成环 |
| Grid | `grid` | 节点排列成网格 |
| Star | `star` | 星形拓扑 |
| Sugiyama | `sugiyama` | 分层/层次化 |
| Random | `random` | 随机放置 |

## 社区检测

直接在 G6 数据上进行社区检测 — 无需手动转换图数据。

```typescript
import { detectCommunities } from '@graphrs/g6';
import type { G6GraphData } from '@graphrs/g6';

const data: G6GraphData = {
  nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }, { id: 'f' }],
  edges: [
    { source: 'a', target: 'b' },
    { source: 'b', target: 'c' },
    { source: 'c', target: 'a' },
    { source: 'd', target: 'e' },
    { source: 'e', target: 'f' },
    { source: 'f', target: 'd' },
    { source: 'c', target: 'd' },  // 连接两个聚类的桥接边
  ],
};

const result = await detectCommunities(data, 'louvain');

// result.communities: Map<string, number> — 节点 id → 社区索引
// result.modularity: number — 质量评分 (0–1)
// result.clusterCount: number — 检测到的社区数量

// 按社区着色
const colors = ['#5B8DEF', '#F5A623', '#7ED321', '#D0021B'];
data.nodes.forEach((node) => {
  const community = result.communities.get(node.id) ?? 0;
  node.style = { fill: colors[community % colors.length] };
});
```

### 支持的算法

`'louvain'` | `'leiden'` | `'infomap'` | `'label-propagation'` | `'walktrap'` | `'fast-greedy'`

## 中心性分析

直接在 G6 数据上计算节点重要性。

```typescript
import { computeCentrality } from '@graphrs/g6';

const centrality = await computeCentrality(data, 'pagerank');

// centrality.scores: Map<string, number> — 节点 id → 分数

// 按重要性缩放节点大小
data.nodes.forEach((node) => {
  const score = centrality.scores.get(node.id) ?? 0;
  node.style = { ...node.style, size: 20 + score * 200 };
});
```

### 支持的算法

`'pagerank'` | `'betweenness'` | `'closeness'` | `'eigenvector'`

## 完整示例 — 分析 + 可视化

```typescript
import { Graph } from '@antv/g6';
import { createGraphrsLayout, detectCommunities, computeCentrality } from '@graphrs/g6';

const data = {
  nodes: [
    { id: 'alice' }, { id: 'bob' }, { id: 'carol' },
    { id: 'dave' }, { id: 'eve' }, { id: 'frank' },
  ],
  edges: [
    { source: 'alice', target: 'bob' },
    { source: 'bob', target: 'carol' },
    { source: 'carol', target: 'alice' },
    { source: 'dave', target: 'eve' },
    { source: 'eve', target: 'frank' },
    { source: 'frank', target: 'dave' },
    { source: 'carol', target: 'dave' },
  ],
};

// 并行运行分析
const [communities, centrality] = await Promise.all([
  detectCommunities(data, 'louvain'),
  computeCentrality(data, 'pagerank'),
]);

// 将结果应用到节点样式
const colors = ['#5B8DEF', '#F5A623', '#7ED321', '#D0021B'];
data.nodes.forEach((node) => {
  const community = communities.communities.get(node.id) ?? 0;
  const score = centrality.scores.get(node.id) ?? 0;
  node.style = {
    fill: colors[community % colors.length],
    size: 24 + score * 150,
  };
});

// 使用 graphrs 布局渲染
const graph = new Graph({
  container: 'graph-container',
  width: 800,
  height: 600,
  data,
  layout: createGraphrsLayout({ algorithm: 'fruchterman-reingold' }),
  node: { style: { labelText: (d) => d.id } },
  edge: { style: { stroke: '#ccc', lineWidth: 1.5 } },
});

graph.render();
```

## 底层 API

对于高级用法，`@graphrs/g6` 还导出了适配器函数：

```typescript
import { g6ToGraph, graphToG6, layoutResultToPositions } from '@graphrs/g6';

// 将 G6 数据 → graphrs Graph（用于自定义算法管线）
const { graph, idToIndex, indexToId } = g6ToGraph(data);

// 在转换后的图上运行任意 graphrs 算法...
// 然后转换回 G6 格式
const g6Data = graphToG6(graph, indexToId, layoutResult);
```

### `g6ToGraph(data)`

将 G6 图数据转换为带数字索引的 graphrs `Graph`。

返回 `{ graph, idToIndex, indexToId }` — 字符串 ID 和数字索引之间的双向映射。

### `graphToG6(graph, indexToId, layout?)`

将 graphrs `Graph` 转换回 G6 格式，可选择将布局位置作为 `style.x` / `style.y` 应用。

### `layoutResultToPositions(layout, nodeIds, center?, width?, height?)`

将原始布局坐标归一化为定位映射 `{ [nodeId]: { x, y } }`，居中并缩放以适应给定尺寸。

## 直接使用 `@graphrs/core`

如果只需要基础图构建而不需要 G6 专用助手：

```typescript
import { Graph } from '@graphrs/core';

const g = Graph.fromEdges([[0, 1], [1, 2], [2, 3], [3, 0]]);
const data = g.toG6Format();
// data.nodes: [{ id: "0" }, { id: "1" }, ...]
// data.edges: [{ source: "0", target: "1" }, ...]
```

当你从零开始用数字 ID 构建图，只需要快速序列化时很有用。
