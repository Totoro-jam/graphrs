# D3 Force 集成

[D3.js](https://d3js.org/) 是最流行的数据驱动可视化库。虽然 graphrs 没有提供内置的 D3 序列化器，但将图数据转换为 D3 力模拟格式非常简单。

## 安装

```bash
npm install @graphrs/core @graphrs/centrality d3
```

## 基本示例

```typescript
import * as d3 from 'd3';
import { Graph } from '@graphrs/core';
import { pagerank } from '@graphrs/centrality';

// 构建图
const graph = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [0, 2],
  [1, 3],
]);

// 计算 PageRank 用于节点大小
const pr = await pagerank(graph);

// 转换为 D3 格式
const nodes = graph.nodes().map((id, i) => ({
  id,
  radius: 5 + pr.scores[i]! * 50,
}));

const links = graph.edges().map((e) => ({
  source: e.source,
  target: e.target,
}));

// 设置 SVG
const width = 800;
const height = 600;
const svg = d3.select('#graph').append('svg').attr('width', width).attr('height', height);

// 创建力导向模拟
const simulation = d3
  .forceSimulation(nodes)
  .force(
    'link',
    d3.forceLink(links).id((d: any) => d.id),
  )
  .force('charge', d3.forceManyBody().strength(-200))
  .force('center', d3.forceCenter(width / 2, height / 2));

// 绘制边
const link = svg
  .selectAll('line')
  .data(links)
  .join('line')
  .attr('stroke', '#999')
  .attr('stroke-width', 1.5);

// 绘制节点
const node = svg
  .selectAll('circle')
  .data(nodes)
  .join('circle')
  .attr('r', (d) => d.radius)
  .attr('fill', '#5B8DEF');

// 每帧更新位置
simulation.on('tick', () => {
  link
    .attr('x1', (d: any) => d.source.x)
    .attr('y1', (d: any) => d.source.y)
    .attr('x2', (d: any) => d.target.x)
    .attr('y2', (d: any) => d.target.y);

  node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
});
```

## 使用 graphrs 布局代替 D3 力模拟

你可以使用 graphrs 的布局算法代替 D3 的力模拟，以获得确定性的节点定位：

```typescript
import { layoutFR } from '@graphrs/layout';

const layout = await layoutFR(graph);

const nodes = graph.nodes().map((id, i) => ({
  id,
  x: layout.positions[i]![0],
  y: layout.positions[i]![1],
}));

// 只用 D3 渲染，无需模拟
const svg = d3.select('#graph').append('svg');

svg
  .selectAll('circle')
  .data(nodes)
  .join('circle')
  .attr('cx', (d) => d.x)
  .attr('cy', (d) => d.y)
  .attr('r', 8)
  .attr('fill', '#5B8DEF');
```

## 数据转换辅助函数

```typescript
function toD3Format(graph: Graph) {
  return {
    nodes: graph.nodes().map((id) => ({
      id,
      ...graph.nodeData(id),
    })),
    links: graph.edges().map((e) => ({
      source: e.source,
      target: e.target,
      ...e.data,
    })),
  };
}
```
