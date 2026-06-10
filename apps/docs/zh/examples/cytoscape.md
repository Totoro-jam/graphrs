# Cytoscape.js 集成

[Cytoscape.js](https://js.cytoscape.org/) 是一个功能完备的图论库，支持分析和可视化 — GitHub 19k+ Stars，广泛应用于生物信息学、社交网络分析和知识图谱。graphrs 提供了内置的 `toCytoscapeFormat()` 序列化器，与 Cytoscape 的渲染引擎完美配合。

**为什么组合使用 graphrs + Cytoscape.js？** Cytoscape.js 有优秀的可视化能力，但分析算法有限（仅 2 种中心性度量，无社区检测）。graphrs 以原生速度填补了 400+ 算法的空白，而 Cytoscape 负责交互式渲染。

## 安装

```bash
npm install @graphrs/core @graphrs/community @graphrs/centrality @graphrs/layout cytoscape
```

TypeScript 项目还需安装：

```bash
npm install -D @types/cytoscape
```

## 快速开始 — 社区检测 + 可视化

```typescript
import cytoscape from 'cytoscape';
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';

// 构建图
const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0],   // 社区 A
  [3, 4], [4, 5], [5, 3],   // 社区 B
  [2, 3],                    // 桥边
]);

// 用 graphrs 检测社区（WASM 执行 — 即时完成）
const communities = await louvain(graph);

// 转换为 Cytoscape 格式
const data = graph.toCytoscapeFormat();

// 为节点添加社区标签
const colors = ['#5B8DEF', '#F5A623', '#7ED321', '#D0021B', '#9013FE'];
data.elements.nodes.forEach((node, i) => {
  node.data.community = communities.membership[i];
  node.data.color = colors[communities.membership[i]! % colors.length];
});

// 使用 Cytoscape 渲染
const cy = cytoscape({
  container: document.getElementById('cy'),
  elements: data.elements,
  style: [
    {
      selector: 'node',
      style: {
        'background-color': 'data(color)',
        'label': 'data(id)',
        'text-valign': 'center',
        'font-size': '10px',
        'width': 30,
        'height': 30,
      },
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#ccc',
        'curve-style': 'bezier',
      },
    },
  ],
  layout: { name: 'cose', animate: true },
});
```

## 数据格式

`toCytoscapeFormat()` 产生 Cytoscape 的元素格式：

```typescript
const data = graph.toCytoscapeFormat();
// {
//   elements: {
//     nodes: [{ data: { id: "0" } }, { data: { id: "1" } }, ...],
//     edges: [{ data: { source: "0", target: "1" } }, ...]
//   }
// }
```

当传入布局结果时，预计算坐标会包含在内：

```typescript
import { layoutFR } from '@graphrs/layout';

const layout = await layoutFR(graph);
const data = graph.toCytoscapeFormat(layout);
// nodes[0].position = { x: 120.5, y: 80.3 }

// 使用 'preset' 布局应用预计算坐标
const cy = cytoscape({
  container: document.getElementById('cy'),
  elements: data.elements,
  layout: { name: 'preset' },
});
```

## 预计算布局（比 `cose` 更快）

Cytoscape 内置的 `cose` 布局是迭代式的，在大图上可能很慢。使用 graphrs 布局算法获得确定性的即时结果：

```typescript
import { Graph } from '@graphrs/core';
import { layoutKK } from '@graphrs/layout';

const graph = Graph.fromEdges(largeEdgeList);

// graphrs KK 布局 — 1000 节点约 50ms（对比 cose: ~2s）
const layout = await layoutKK(graph, { maxIterations: 300 });
const data = graph.toCytoscapeFormat(layout);

const cy = cytoscape({
  container: document.getElementById('cy'),
  elements: data.elements,
  layout: { name: 'preset' },  // 即时 — 坐标已预计算
  style: [
    { selector: 'node', style: { 'background-color': '#5B8DEF', 'width': 20, 'height': 20 } },
    { selector: 'edge', style: { 'width': 1.5, 'line-color': '#ddd' } },
  ],
});
```

### 布局算法对比

| 算法 | 适用场景 | 速度（1k 节点） |
|------|----------|-----------------|
| `layoutFR` | 通用图，有机外观 | ~30ms |
| `layoutKK` | 中小型图，美观 | ~50ms |
| `layoutCircle` | 环形/环路强调 | <1ms |
| `layoutSugiyama` | DAG，层次结构 | ~20ms |
| Cytoscape `cose` | （内置对比） | ~2000ms |

## 完整流水线 — 布局 + 社区 + 中心性

```typescript
import { Graph } from '@graphrs/core';
import { layoutFR } from '@graphrs/layout';
import { louvain } from '@graphrs/community';
import { betweenness } from '@graphrs/centrality';
import cytoscape from 'cytoscape';

const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 3], [3, 0], [0, 2],
  [4, 5], [5, 6], [6, 7], [7, 4], [4, 6],
  [3, 4],  // 桥边
]);

// 并行运行所有分析
const [layout, communities, bc] = await Promise.all([
  layoutFR(graph, { iterations: 500 }),
  louvain(graph),
  betweenness(graph),
]);

// 构建带分析结果的 Cytoscape 数据
const data = graph.toCytoscapeFormat(layout);
const colors = ['#5B8DEF', '#F5A623', '#7ED321', '#D0021B'];
const maxScore = Math.max(...bc.scores);

data.elements.nodes.forEach((node, i) => {
  const community = communities.membership[i]!;
  const score = bc.scores[i]! / maxScore;  // 归一化到 0–1

  node.data.community = community;
  node.data.color = colors[community % colors.length];
  node.data.size = 20 + score * 40;  // 按介数中心性确定大小
});

const cy = cytoscape({
  container: document.getElementById('cy'),
  elements: data.elements,
  layout: { name: 'preset' },
  style: [
    {
      selector: 'node',
      style: {
        'background-color': 'data(color)',
        'width': 'data(size)',
        'height': 'data(size)',
        'label': 'data(id)',
        'font-size': '9px',
        'text-valign': 'center',
      },
    },
    {
      selector: 'edge',
      style: {
        'width': 1.5,
        'line-color': '#e0e0e0',
        'curve-style': 'bezier',
      },
    },
  ],
});
```

## 通过事件进行交互式分析

将 Cytoscape 的事件系统与 graphrs 分析结合，实现按需计算：

```typescript
import { dijkstra } from '@graphrs/path';

// 点击节点时高亮最短路径
cy.on('tap', 'node', async (event) => {
  const sourceId = parseInt(event.target.id());
  const targetId = 0;  // 固定目标

  const result = await dijkstra(graph, sourceId, targetId);

  // 重置样式
  cy.elements().removeClass('highlighted');

  // 高亮路径
  for (let i = 0; i < result.path.length - 1; i++) {
    const edgeId = `${result.path[i]}-${result.path[i + 1]}`;
    cy.$id(edgeId).addClass('highlighted');
    cy.$id(String(result.path[i])).addClass('highlighted');
  }
});
```

## 何时使用 graphrs vs Cytoscape 内置功能

| 任务 | 使用 graphrs | 使用 Cytoscape |
|------|-------------|----------------|
| 社区检测 | 始终（Cytoscape 没有此功能） | — |
| 中心性（pagerank、特征向量） | 始终（Cytoscape 缺少这些） | — |
| 介数/紧密度中心性 | graphrs（大规模更快） | 小图可用内置 |
| 布局（力导向） | 大图（>500 节点） | 小图带动画 |
| 最短路径 | graphrs（Dijkstra、Bellman-Ford） | `eles.dijkstra()` 简单场景 |
| 渲染 + 交互 | — | 始终 |
| 导出为图片 | — | `cy.png()` / `cy.jpg()` |
