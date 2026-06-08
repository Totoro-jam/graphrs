# Cytoscape.js Integration

[Cytoscape.js](https://js.cytoscape.org/) is a fully-featured graph theory library for analysis and visualization. graphrs provides a built-in `toCytoscapeFormat()` serializer.

## Installation

```bash
npm install @graphrs/core @graphrs/community cytoscape
```

## Basic Example

```typescript
import cytoscape from 'cytoscape';
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';

// Build graph
const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0],
  [3, 4], [4, 5], [5, 3],
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
        'label': 'data(id)',
      },
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#ccc',
      },
    },
  ],
  layout: { name: 'cose' },
});
```

## Data Format

`toCytoscapeFormat()` produces Cytoscape's nested format:

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

When a `LayoutResult` is passed, `x` and `y` are included in each node's `data`:

```typescript
const layout = await layoutFR(graph);
const data = graph.toCytoscapeFormat(layout);
// nodes[0].data.x = 120.5, nodes[0].data.y = 80.3

const cy = cytoscape({
  elements: data.elements,
  layout: { name: 'preset' }, // use pre-computed positions
});
```

## Analysis Pipeline

```typescript
import { betweenness } from '@graphrs/centrality';
import { isConnected } from '@graphrs/flow';

const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 0],
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
