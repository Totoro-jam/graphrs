# Cytoscape.js 集成

[Cytoscape.js](https://js.cytoscape.org/) 是一个功能完备的图论库，支持分析和可视化。graphrs 提供了内置的 `toCytoscapeFormat()` 序列化器。

## 安装

```bash
npm install @graphrs/core @graphrs/community cytoscape
```

## 基本示例

```typescript
import cytoscape from 'cytoscape';
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';

// Build graph
const graph = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 0],
  [3, 4],
  [4, 5],
  [5, 3],
  [2, 3],
]);

// Detect communities
const communities = await louvain(graph);

// Convert to Cytoscape format
const data = graph.toCytoscapeFormat();

// Add community class for styling
const colors = ['#5B8DEF', '#F5A623', '#7ED321'];
data.elements.nodes.forEach((node, i) => {
  node.data.community = communities.membership[i];
});

// Render
const cy = cytoscape({
  container: document.getElementById('cy'),
  elements: data.elements,
  style: [
    {
      selector: 'node',
      style: {
        'background-color': (ele) => {
          const comm = ele.data('community') as number;
          return colors[comm % colors.length]!;
        },
        label: 'data(id)',
      },
    },
    {
      selector: 'edge',
      style: {
        width: 2,
        'line-color': '#ccc',
      },
    },
  ],
  layout: { name: 'cose' },
});
```

## 数据格式

`toCytoscapeFormat()` 产生 Cytoscape 的嵌套格式：

```typescript
{
  elements: {
    nodes: [
      { data: { id: "0", ...customData } },
      { data: { id: "1", ...customData } },
    ],
    edges: [
      { data: { source: "0", target: "1", ...customData } },
    ]
  }
}
```

当传入 `LayoutResult` 时，每个节点的 `data` 中会包含 `x` 和 `y` 坐标：

```typescript
const layout = await layoutFR(graph);
const data = graph.toCytoscapeFormat(layout);
// nodes[0].data.x = 120.5, nodes[0].data.y = 80.3

const cy = cytoscape({
  elements: data.elements,
  layout: { name: 'preset' }, // use pre-computed positions
});
```

## 分析流水线

```typescript
import { betweenness } from '@graphrs/centrality';
import { isConnected } from '@graphrs/flow';

const graph = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 0],
]);

// Check connectivity
const connected = await isConnected(graph);

// Compute betweenness centrality
const bc = await betweenness(graph);

// Build Cytoscape data with analysis
const data = graph.toCytoscapeFormat();
data.elements.nodes.forEach((node, i) => {
  node.data.score = bc.scores[i];
});
```
