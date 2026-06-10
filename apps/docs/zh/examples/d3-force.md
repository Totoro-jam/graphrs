# D3 Force 集成

[D3.js](https://d3js.org/) 是数据驱动可视化的黄金标准 — GitHub 109k+ Stars。虽然 graphrs 没有提供内置的 D3 序列化器，但将图数据转换为 D3 力模拟格式非常简单。graphrs 通过提供 D3 所缺乏的高速图算法（社区检测、中心性、布局）来补充 D3。

**为什么组合使用 graphrs + D3？** D3 有 `forceSimulation` 用于物理布局，但零图分析算法。graphrs 以 WASM 速度添加社区检测、中心性、最短路径和确定性布局，而 D3 负责 SVG/Canvas 渲染和交互。

## 安装

```bash
npm install @graphrs/core @graphrs/community @graphrs/centrality @graphrs/layout d3
```

TypeScript 项目：

```bash
npm install -D @types/d3
```

## 快速开始 — PageRank + 力导向布局

```typescript
import * as d3 from 'd3';
import { Graph } from '@graphrs/core';
import { pagerank } from '@graphrs/centrality';

// 构建图
const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3],
]);

// 计算 PageRank 用于节点大小
const pr = await pagerank(graph);

// 转换为 D3 格式
interface D3Node extends d3.SimulationNodeDatum {
  id: number;
  radius: number;
  score: number;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: number;
  target: number;
}

const nodes: D3Node[] = graph.nodes().map((id, i) => ({
  id,
  radius: 6 + pr.scores[i]! * 60,
  score: pr.scores[i]!,
}));

const links: D3Link[] = graph.edges().map((e) => ({
  source: e.source,
  target: e.target,
}));

// 设置 SVG
const width = 800;
const height = 600;
const svg = d3.select('#graph')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .attr('viewBox', [0, 0, width, height]);

// 创建力导向模拟
const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links).id((d: any) => d.id).distance(80))
  .force('charge', d3.forceManyBody().strength(-200))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('collision', d3.forceCollide().radius((d: any) => d.radius + 2));

// 绘制边
const link = svg.append('g')
  .selectAll('line')
  .data(links)
  .join('line')
  .attr('stroke', '#999')
  .attr('stroke-opacity', 0.6)
  .attr('stroke-width', 1.5);

// 绘制节点（按 PageRank 确定大小）
const node = svg.append('g')
  .selectAll('circle')
  .data(nodes)
  .join('circle')
  .attr('r', (d) => d.radius)
  .attr('fill', '#5B8DEF')
  .attr('stroke', '#fff')
  .attr('stroke-width', 1.5)
  .call(drag(simulation));

// 节点标签
svg.append('g')
  .selectAll('text')
  .data(nodes)
  .join('text')
  .text((d) => `${d.id} (${d.score.toFixed(2)})`)
  .attr('font-size', '9px')
  .attr('text-anchor', 'middle')
  .attr('dy', -12);

// 每帧更新位置
simulation.on('tick', () => {
  link
    .attr('x1', (d: any) => d.source.x)
    .attr('y1', (d: any) => d.source.y)
    .attr('x2', (d: any) => d.target.x)
    .attr('y2', (d: any) => d.target.y);

  node
    .attr('cx', (d: any) => d.x)
    .attr('cy', (d: any) => d.y);
});

// 拖拽行为
function drag(sim: d3.Simulation<D3Node, D3Link>) {
  return d3.drag<SVGCircleElement, D3Node>()
    .on('start', (event, d) => {
      if (!event.active) sim.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on('drag', (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on('end', (event, d) => {
      if (!event.active) sim.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });
}
```

## 社区检测 + 颜色编码

D3 没有社区检测功能。使用 graphrs 查找聚类，然后对节点着色：

```typescript
import { louvain } from '@graphrs/community';

const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0],   // 社区 A
  [3, 4], [4, 5], [5, 3],   // 社区 B
  [6, 7], [7, 8], [8, 6],   // 社区 C
  [2, 3], [5, 6],           // 桥边
]);

const communities = await louvain(graph);
const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

const nodes = graph.nodes().map((id, i) => ({
  id,
  community: communities.membership[i]!,
  color: colorScale(String(communities.membership[i])),
}));

// 在节点渲染中使用社区颜色
svg.selectAll('circle')
  .data(nodes)
  .join('circle')
  .attr('r', 10)
  .attr('fill', (d) => d.color);
```

## 确定性布局（无模拟）

D3 的力模拟是非确定性的 — 每次运行产生不同的位置。使用 graphrs 布局获得可重现的结果：

```typescript
import { layoutFR } from '@graphrs/layout';

const graph = Graph.fromEdges(edges);
const layout = await layoutFR(graph, { iterations: 500 });

// 缩放布局坐标到 SVG 尺寸
const xExtent = d3.extent(layout.positions, (p) => p[0]) as [number, number];
const yExtent = d3.extent(layout.positions, (p) => p[1]) as [number, number];

const xScale = d3.scaleLinear().domain(xExtent).range([50, width - 50]);
const yScale = d3.scaleLinear().domain(yExtent).range([50, height - 50]);

const nodes = graph.nodes().map((id, i) => ({
  id,
  x: xScale(layout.positions[i]![0]),
  y: yScale(layout.positions[i]![1]),
}));

// 使用静态位置渲染 — 无需模拟
svg.selectAll('circle')
  .data(nodes)
  .join('circle')
  .attr('cx', (d) => d.x)
  .attr('cy', (d) => d.y)
  .attr('r', 8)
  .attr('fill', '#5B8DEF');
```

### 布局算法对比

| | D3 `forceSimulation` | graphrs `layoutFR` | graphrs `layoutKK` |
|---|---|---|---|
| 确定性 | 否 | 是 | 是 |
| 速度（1k 节点） | ~3s（300 ticks） | ~30ms | ~50ms |
| 动画 | 内置（tick） | 需手动 | 需手动 |
| 结果质量 | 良好 | 良好 | 优秀 |

## 完整示例 — 分析仪表板

组合多个 graphrs 算法与 D3 可视化，构建完整的分析仪表板：

```typescript
import * as d3 from 'd3';
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';
import { betweenness } from '@graphrs/centrality';
import { layoutFR } from '@graphrs/layout';

async function renderGraph(edges: [number, number][]) {
  const graph = Graph.fromEdges(edges);

  // 并行运行所有分析（500 节点总计约 50ms）
  const [layout, communities, bc] = await Promise.all([
    layoutFR(graph, { iterations: 500 }),
    louvain(graph),
    betweenness(graph),
  ]);

  const colorScale = d3.scaleOrdinal(d3.schemeTableau10);
  const maxBC = Math.max(...bc.scores);

  // 缩放布局到 SVG
  const xExtent = d3.extent(layout.positions, (p) => p[0]) as [number, number];
  const yExtent = d3.extent(layout.positions, (p) => p[1]) as [number, number];
  const xScale = d3.scaleLinear().domain(xExtent).range([60, 740]);
  const yScale = d3.scaleLinear().domain(yExtent).range([60, 540]);

  const nodes = graph.nodes().map((id, i) => ({
    id,
    x: xScale(layout.positions[i]![0]),
    y: yScale(layout.positions[i]![1]),
    community: communities.membership[i]!,
    centrality: bc.scores[i]! / maxBC,
    color: colorScale(String(communities.membership[i])),
    radius: 5 + (bc.scores[i]! / maxBC) * 20,
  }));

  const links = graph.edges().map((e) => ({
    source: nodes.find((n) => n.id === e.source)!,
    target: nodes.find((n) => n.id === e.target)!,
  }));

  // 渲染
  const svg = d3.select('#graph').append('svg')
    .attr('width', 800).attr('height', 600);

  svg.append('g').selectAll('line')
    .data(links).join('line')
    .attr('x1', (d) => d.source.x).attr('y1', (d) => d.source.y)
    .attr('x2', (d) => d.target.x).attr('y2', (d) => d.target.y)
    .attr('stroke', '#e0e0e0').attr('stroke-width', 1);

  svg.append('g').selectAll('circle')
    .data(nodes).join('circle')
    .attr('cx', (d) => d.x).attr('cy', (d) => d.y)
    .attr('r', (d) => d.radius)
    .attr('fill', (d) => d.color)
    .attr('stroke', '#fff').attr('stroke-width', 1)
    .append('title')
    .text((d) => `节点 ${d.id}\n社区: ${d.community}\n中心性: ${d.centrality.toFixed(3)}`);
}
```

## 数据转换辅助函数

可复用的工具函数，将 graphrs `Graph` 转换为 D3 格式：

```typescript
import type { Graph } from '@graphrs/core';

interface D3GraphData<N = {}, L = {}> {
  nodes: (d3.SimulationNodeDatum & { id: number } & N)[];
  links: (d3.SimulationLinkDatum<any> & L)[];
}

function toD3Format<N = {}, L = {}>(
  graph: Graph,
  nodeMapper?: (id: number, index: number) => N,
  linkMapper?: (source: number, target: number) => L,
): D3GraphData<N, L> {
  return {
    nodes: graph.nodes().map((id, i) => ({
      id,
      ...(nodeMapper ? nodeMapper(id, i) : ({} as N)),
    })),
    links: graph.edges().map((e) => ({
      source: e.source,
      target: e.target,
      ...(linkMapper ? linkMapper(e.source, e.target) : ({} as L)),
    })),
  };
}
```

## 何时使用 graphrs 布局 vs D3 模拟

| 场景 | 推荐方案 |
|------|----------|
| 需要收敛动画 | D3 `forceSimulation` |
| 大图（>500 节点） | graphrs 布局（快 100 倍） |
| 确定性/可重现 | graphrs 布局 |
| 交互拖拽 | D3 模拟 + `d.fx`/`d.fy` |
| 层次/分层布局 | graphrs `layoutSugiyama` |
| 服务端渲染 | graphrs 布局（无需 DOM） |
