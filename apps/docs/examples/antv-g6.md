# AntV G6 Integration

[AntV G6](https://g6.antv.antgroup.com/) is a graph visualization engine from Ant Group. The `@graphrs/g6` package provides plug-and-play integration — layout engines, community detection, and centrality analysis that work directly with G6 5.x data formats.

## Installation

```bash
npm install @graphrs/g6 @antv/g6
```

`@graphrs/g6` bundles `@graphrs/core`, `@graphrs/layout`, `@graphrs/community`, and `@graphrs/centrality` as dependencies — no need to install them separately.

## Quick Start — Custom Layout

The fastest way to use graphrs with G6: register graphrs layout algorithms as G6 custom layouts.

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

### Available Layout Algorithms

| Algorithm | Key | Notes |
|-----------|-----|-------|
| Fruchterman-Reingold | `fruchterman-reingold` | Force-directed, good for general graphs |
| Kamada-Kawai | `kamada-kawai` | Energy-minimized, aesthetic for small-medium graphs |
| Circle | `circle` | Nodes on a circle |
| Grid | `grid` | Nodes on a grid |
| Star | `star` | Star topology |
| Sugiyama | `sugiyama` | Layered/hierarchical |
| Random | `random` | Random placement |

## Community Detection

Detect communities directly from G6 data — no manual graph conversion needed.

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
    { source: 'c', target: 'd' },  // bridge between clusters
  ],
};

const result = await detectCommunities(data, 'louvain');

// result.communities: Map<string, number> — node id → community index
// result.modularity: number — quality score (0–1)
// result.clusterCount: number — number of communities found

// Color nodes by community
const colors = ['#5B8DEF', '#F5A623', '#7ED321', '#D0021B'];
data.nodes.forEach((node) => {
  const community = result.communities.get(node.id) ?? 0;
  node.style = { fill: colors[community % colors.length] };
});
```

### Supported Algorithms

`'louvain'` | `'leiden'` | `'infomap'` | `'label-propagation'` | `'walktrap'` | `'fast-greedy'`

## Centrality Analysis

Compute node importance directly from G6 data.

```typescript
import { computeCentrality } from '@graphrs/g6';

const centrality = await computeCentrality(data, 'pagerank');

// centrality.scores: Map<string, number> — node id → score

// Scale node size by importance
data.nodes.forEach((node) => {
  const score = centrality.scores.get(node.id) ?? 0;
  node.style = { ...node.style, size: 20 + score * 200 };
});
```

### Supported Algorithms

`'pagerank'` | `'betweenness'` | `'closeness'` | `'eigenvector'`

## Full Example — Analysis + Visualization

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

// Run analysis in parallel
const [communities, centrality] = await Promise.all([
  detectCommunities(data, 'louvain'),
  computeCentrality(data, 'pagerank'),
]);

// Apply results to node styles
const colors = ['#5B8DEF', '#F5A623', '#7ED321', '#D0021B'];
data.nodes.forEach((node) => {
  const community = communities.communities.get(node.id) ?? 0;
  const score = centrality.scores.get(node.id) ?? 0;
  node.style = {
    fill: colors[community % colors.length],
    size: 24 + score * 150,
  };
});

// Render with graphrs-powered layout
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

## Low-level API

For advanced use cases, `@graphrs/g6` also exports adapter functions:

```typescript
import { g6ToGraph, graphToG6, layoutResultToPositions } from '@graphrs/g6';

// Convert G6 data → graphrs Graph (for custom algorithm pipelines)
const { graph, idToIndex, indexToId } = g6ToGraph(data);

// Run any graphrs algorithm on the converted graph...
// then convert back to G6 format
const g6Data = graphToG6(graph, indexToId, layoutResult);
```

### `g6ToGraph(data)`

Converts G6 graph data to a graphrs `Graph` with numeric indices.

Returns `{ graph, idToIndex, indexToId }` — bidirectional maps between string IDs and numeric indices.

### `graphToG6(graph, indexToId, layout?)`

Converts a graphrs `Graph` back to G6 format, optionally applying layout positions as `style.x` / `style.y`.

### `layoutResultToPositions(layout, nodeIds, center?, width?, height?)`

Normalizes raw layout coordinates to a positioned map `{ [nodeId]: { x, y } }`, centered and scaled to fit the given dimensions.

## Using `@graphrs/core` Directly

If you only need basic graph construction without the G6-specific helpers:

```typescript
import { Graph } from '@graphrs/core';

const g = Graph.fromEdges([[0, 1], [1, 2], [2, 3], [3, 0]]);
const data = g.toG6Format();
// data.nodes: [{ id: "0" }, { id: "1" }, ...]
// data.edges: [{ source: "0", target: "1" }, ...]
```

This is useful when you build graphs from scratch with numeric IDs and just need quick serialization.
