# D3 Force Integration

[D3.js](https://d3js.org/) is the most popular library for data-driven visualizations. While graphrs doesn't provide a built-in D3 serializer, converting graph data to D3's force simulation format is straightforward.

## Installation

```bash
npm install @graphrs/core @graphrs/centrality d3
```

## Basic Example

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
const nodes = graph.nodes().map((id, i) => ({
  id,
  radius: 5 + pr.scores[i]! * 50,
}));

const links = graph.edges().map((e) => ({
  source: e.source,
  target: e.target,
}));

// Set up SVG
const width = 800;
const height = 600;
const svg = d3.select('#graph')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

// Create force simulation
const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links).id((d: any) => d.id))
  .force('charge', d3.forceManyBody().strength(-200))
  .force('center', d3.forceCenter(width / 2, height / 2));

// Draw edges
const link = svg.selectAll('line')
  .data(links)
  .join('line')
  .attr('stroke', '#999')
  .attr('stroke-width', 1.5);

// Draw nodes
const node = svg.selectAll('circle')
  .data(nodes)
  .join('circle')
  .attr('r', (d) => d.radius)
  .attr('fill', '#5B8DEF');

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
```

## Using graphrs Layouts Instead

You can use graphrs layout algorithms instead of D3's force simulation for deterministic positioning:

```typescript
import { layoutFR } from '@graphrs/layout';

const layout = await layoutFR(graph);

const nodes = graph.nodes().map((id, i) => ({
  id,
  x: layout.positions[i]![0],
  y: layout.positions[i]![1],
}));

// Use D3 just for rendering, no simulation needed
const svg = d3.select('#graph').append('svg');

svg.selectAll('circle')
  .data(nodes)
  .join('circle')
  .attr('cx', (d) => d.x)
  .attr('cy', (d) => d.y)
  .attr('r', 8)
  .attr('fill', '#5B8DEF');
```

## Data Conversion Helper

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
