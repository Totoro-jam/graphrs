# Cytoscape.js Integration

[Cytoscape.js](https://js.cytoscape.org/) is a fully-featured graph theory library for analysis and visualization — 19k+ GitHub stars, used in bioinformatics, social network analysis, and knowledge graphs. graphrs provides a built-in `toCytoscapeFormat()` serializer and pairs perfectly with Cytoscape's rendering engine.

**Why combine graphrs + Cytoscape.js?** Cytoscape.js has solid visualization but limited analysis algorithms (2 centrality measures, no community detection). graphrs fills the gap with 400+ algorithms at native speed, while Cytoscape handles the interactive rendering.

## Installation

```bash
npm install @graphrs/core @graphrs/community @graphrs/centrality @graphrs/layout cytoscape
```

For TypeScript projects:

```bash
npm install -D @types/cytoscape
```

## Quick Start — Community Detection + Visualization

```typescript
import cytoscape from 'cytoscape';
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';

// Build graph
const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0],   // cluster A
  [3, 4], [4, 5], [5, 3],   // cluster B
  [2, 3],                    // bridge edge
]);

// Detect communities with graphrs (runs in WASM — instant)
const communities = await louvain(graph);

// Convert to Cytoscape format
const data = graph.toCytoscapeFormat();

// Annotate nodes with community labels
const colors = ['#5B8DEF', '#F5A623', '#7ED321', '#D0021B', '#9013FE'];
data.elements.nodes.forEach((node, i) => {
  node.data.community = communities.membership[i];
  node.data.color = colors[communities.membership[i]! % colors.length];
});

// Render with Cytoscape
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

## Data Format

`toCytoscapeFormat()` produces Cytoscape's element format:

```typescript
const data = graph.toCytoscapeFormat();
// {
//   elements: {
//     nodes: [{ data: { id: "0" } }, { data: { id: "1" } }, ...],
//     edges: [{ data: { source: "0", target: "1" } }, ...]
//   }
// }
```

When a layout result is passed, pre-computed positions are included:

```typescript
import { layoutFR } from '@graphrs/layout';

const layout = await layoutFR(graph);
const data = graph.toCytoscapeFormat(layout);
// nodes[0].position = { x: 120.5, y: 80.3 }

// Use 'preset' layout to apply pre-computed positions
const cy = cytoscape({
  container: document.getElementById('cy'),
  elements: data.elements,
  layout: { name: 'preset' },
});
```

## Pre-Computed Layout (Faster Than `cose`)

Cytoscape's built-in `cose` layout is iterative and can be slow on large graphs. Use graphrs layout algorithms for deterministic, instant results:

```typescript
import { Graph } from '@graphrs/core';
import { layoutKK } from '@graphrs/layout';

const graph = Graph.fromEdges(largeEdgeList);

// graphrs KK layout — ~50ms for 1000 nodes (vs cose: ~2s)
const layout = await layoutKK(graph, { maxIterations: 300 });
const data = graph.toCytoscapeFormat(layout);

const cy = cytoscape({
  container: document.getElementById('cy'),
  elements: data.elements,
  layout: { name: 'preset' },  // instant — positions already computed
  style: [
    { selector: 'node', style: { 'background-color': '#5B8DEF', 'width': 20, 'height': 20 } },
    { selector: 'edge', style: { 'width': 1.5, 'line-color': '#ddd' } },
  ],
});
```

### Layout Algorithm Comparison

| Algorithm | Best for | Speed (1k nodes) |
|-----------|----------|-------------------|
| `layoutFR` | General graphs, organic look | ~30ms |
| `layoutKK` | Small-medium, aesthetic | ~50ms |
| `layoutCircle` | Ring/cycle emphasis | <1ms |
| `layoutSugiyama` | DAGs, hierarchies | ~20ms |
| Cytoscape `cose` | (built-in comparison) | ~2000ms |

## Full Pipeline — Layout + Community + Centrality

```typescript
import { Graph } from '@graphrs/core';
import { layoutFR } from '@graphrs/layout';
import { louvain } from '@graphrs/community';
import { betweenness } from '@graphrs/centrality';
import cytoscape from 'cytoscape';

const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 3], [3, 0], [0, 2],
  [4, 5], [5, 6], [6, 7], [7, 4], [4, 6],
  [3, 4],  // bridge
]);

// Run all analyses in parallel
const [layout, communities, bc] = await Promise.all([
  layoutFR(graph, { iterations: 500 }),
  louvain(graph),
  betweenness(graph),
]);

// Build Cytoscape data with analysis results
const data = graph.toCytoscapeFormat(layout);
const colors = ['#5B8DEF', '#F5A623', '#7ED321', '#D0021B'];
const maxScore = Math.max(...bc.scores);

data.elements.nodes.forEach((node, i) => {
  const community = communities.membership[i]!;
  const score = bc.scores[i]! / maxScore;  // normalize 0–1

  node.data.community = community;
  node.data.color = colors[community % colors.length];
  node.data.size = 20 + score * 40;  // size by betweenness
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

## Interactive Analysis with Events

Combine Cytoscape's event system with graphrs analysis for on-demand computation:

```typescript
import { dijkstra } from '@graphrs/path';

// Highlight shortest path on node tap
cy.on('tap', 'node', async (event) => {
  const sourceId = parseInt(event.target.id());
  const targetId = 0;  // fixed target

  const result = await dijkstra(graph, sourceId, targetId);

  // Reset styles
  cy.elements().removeClass('highlighted');

  // Highlight path
  for (let i = 0; i < result.path.length - 1; i++) {
    const edgeId = `${result.path[i]}-${result.path[i + 1]}`;
    cy.$id(edgeId).addClass('highlighted');
    cy.$id(String(result.path[i])).addClass('highlighted');
  }
});
```

## When to Use graphrs vs Cytoscape Built-ins

| Task | Use graphrs | Use Cytoscape |
|------|------------|---------------|
| Community detection | Always (Cytoscape has none) | — |
| Centrality (pagerank, eigenvector) | Always (Cytoscape lacks these) | — |
| Betweenness/closeness | graphrs (faster at scale) | OK for small graphs |
| Layout (force-directed) | Large graphs (>500 nodes) | Small graphs with animation |
| Shortest path | graphrs (Dijkstra, Bellman-Ford) | `eles.dijkstra()` for simple cases |
| Rendering + interaction | — | Always |
| Export to image | — | `cy.png()` / `cy.jpg()` |
