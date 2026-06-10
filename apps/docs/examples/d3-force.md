# D3 Force Integration

[D3.js](https://d3js.org/) is the gold standard for data-driven visualizations — 109k+ GitHub stars. While graphrs doesn't provide a built-in D3 serializer, converting graph data to D3's force simulation format is straightforward. graphrs complements D3 by providing fast graph algorithms (community detection, centrality, layout) that D3 lacks.

**Why combine graphrs + D3?** D3 has `forceSimulation` for physics-based layout but zero graph analysis algorithms. graphrs adds community detection, centrality, shortest paths, and deterministic layouts — all at WASM speed — while D3 handles the SVG/Canvas rendering and interaction.

## Installation

```bash
npm install @graphrs/core @graphrs/community @graphrs/centrality @graphrs/layout d3
```

For TypeScript:

```bash
npm install -D @types/d3
```

## Quick Start — PageRank + Force Layout

```typescript
import * as d3 from 'd3';
import { Graph } from '@graphrs/core';
import { pagerank } from '@graphrs/centrality';

// Build graph
const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3],
]);

// Compute PageRank for node sizing
const pr = await pagerank(graph);

// Convert to D3 format
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

// Set up SVG
const width = 800;
const height = 600;
const svg = d3.select('#graph')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .attr('viewBox', [0, 0, width, height]);

// Create force simulation
const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links).id((d: any) => d.id).distance(80))
  .force('charge', d3.forceManyBody().strength(-200))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('collision', d3.forceCollide().radius((d: any) => d.radius + 2));

// Draw edges
const link = svg.append('g')
  .selectAll('line')
  .data(links)
  .join('line')
  .attr('stroke', '#999')
  .attr('stroke-opacity', 0.6)
  .attr('stroke-width', 1.5);

// Draw nodes (sized by PageRank)
const node = svg.append('g')
  .selectAll('circle')
  .data(nodes)
  .join('circle')
  .attr('r', (d) => d.radius)
  .attr('fill', '#5B8DEF')
  .attr('stroke', '#fff')
  .attr('stroke-width', 1.5)
  .call(drag(simulation));

// Node labels
svg.append('g')
  .selectAll('text')
  .data(nodes)
  .join('text')
  .text((d) => `${d.id} (${d.score.toFixed(2)})`)
  .attr('font-size', '9px')
  .attr('text-anchor', 'middle')
  .attr('dy', -12);

// Update positions on tick
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

// Drag behavior
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

## Community Detection + Color Coding

D3 has no community detection. Use graphrs to find clusters, then color nodes accordingly:

```typescript
import { louvain } from '@graphrs/community';

const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0],   // cluster A
  [3, 4], [4, 5], [5, 3],   // cluster B
  [6, 7], [7, 8], [8, 6],   // cluster C
  [2, 3], [5, 6],           // bridges
]);

const communities = await louvain(graph);
const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

const nodes = graph.nodes().map((id, i) => ({
  id,
  community: communities.membership[i]!,
  color: colorScale(String(communities.membership[i])),
}));

// Use community color in node rendering
svg.selectAll('circle')
  .data(nodes)
  .join('circle')
  .attr('r', 10)
  .attr('fill', (d) => d.color);
```

## Deterministic Layout (No Simulation)

D3's force simulation is non-deterministic — each run produces different positions. Use graphrs layouts for reproducible results:

```typescript
import { layoutFR } from '@graphrs/layout';

const graph = Graph.fromEdges(edges);
const layout = await layoutFR(graph, { iterations: 500 });

// Scale layout coordinates to SVG dimensions
const xExtent = d3.extent(layout.positions, (p) => p[0]) as [number, number];
const yExtent = d3.extent(layout.positions, (p) => p[1]) as [number, number];

const xScale = d3.scaleLinear().domain(xExtent).range([50, width - 50]);
const yScale = d3.scaleLinear().domain(yExtent).range([50, height - 50]);

const nodes = graph.nodes().map((id, i) => ({
  id,
  x: xScale(layout.positions[i]![0]),
  y: yScale(layout.positions[i]![1]),
}));

// Render with static positions — no simulation needed
svg.selectAll('circle')
  .data(nodes)
  .join('circle')
  .attr('cx', (d) => d.x)
  .attr('cy', (d) => d.y)
  .attr('r', 8)
  .attr('fill', '#5B8DEF');
```

### Layout Algorithm Comparison

| | D3 `forceSimulation` | graphrs `layoutFR` | graphrs `layoutKK` |
|---|---|---|---|
| Deterministic | No | Yes | Yes |
| Speed (1k nodes) | ~3s (300 ticks) | ~30ms | ~50ms |
| Animation | Built-in (tick) | Requires manual | Requires manual |
| Result quality | Good | Good | Excellent |

## Full Example — Analysis Dashboard

Combine multiple graphrs algorithms with D3 visualization for a complete analysis dashboard:

```typescript
import * as d3 from 'd3';
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';
import { betweenness } from '@graphrs/centrality';
import { layoutFR } from '@graphrs/layout';

async function renderGraph(edges: [number, number][]) {
  const graph = Graph.fromEdges(edges);

  // Run all analyses in parallel (~50ms total for 500 nodes)
  const [layout, communities, bc] = await Promise.all([
    layoutFR(graph, { iterations: 500 }),
    louvain(graph),
    betweenness(graph),
  ]);

  const colorScale = d3.scaleOrdinal(d3.schemeTableau10);
  const maxBC = Math.max(...bc.scores);

  // Scale layout to SVG
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

  // Render
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
    .text((d) => `Node ${d.id}\nCommunity: ${d.community}\nCentrality: ${d.centrality.toFixed(3)}`);
}
```

## Data Conversion Helper

A reusable utility for converting graphrs `Graph` to D3 format:

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

## When to Use graphrs Layout vs D3 Simulation

| Scenario | Recommendation |
|----------|---------------|
| Need animation during convergence | D3 `forceSimulation` |
| Large graph (>500 nodes) | graphrs layout (100× faster) |
| Deterministic/reproducible | graphrs layout |
| Interactive drag | D3 simulation + `d.fx`/`d.fy` |
| Hierarchical/layered | graphrs `layoutSugiyama` |
| Server-side rendering | graphrs layout (no DOM needed) |
