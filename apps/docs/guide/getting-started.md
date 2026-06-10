<script setup>
const quickExample = `import { Graph } from './graphrs-core.js';

// Create a graph with two clusters
const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0],  // cluster 1
  [3, 4], [4, 5], [5, 3],  // cluster 2
  [2, 3],                   // bridge
]);

console.log('Nodes:', graph.nodeCount());
console.log('Edges:', graph.edgeCount());
console.log('Node 2 neighbors:', graph.neighbors(2));
console.log('Node 2 degree:', graph.degree(2));

// Add custom data
graph.addNode(0, { role: 'bridge-left' });
graph.addNode(3, { role: 'bridge-right' });
console.log('\\nNode 0 data:', JSON.stringify(graph.nodeData(0)));
console.log('Node 3 data:', JSON.stringify(graph.nodeData(3)));
`;
</script>

# Getting Started

## Installation

Install the core package and any algorithm packages you need:

```bash
# Core (required)
npm install @graphrs/core

# Algorithm packages (pick what you need)
npm install @graphrs/community
npm install @graphrs/centrality
npm install @graphrs/path
npm install @graphrs/layout
npm install @graphrs/generators
npm install @graphrs/io
npm install @graphrs/operators
npm install @graphrs/flow
npm install @graphrs/isomorphism
```

::: tip
Each package is independently installable and tree-shakable. Only import what you use — your bundler will exclude the rest.
:::

## Quick Example

```typescript
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';
import { pagerank } from '@graphrs/centrality';

// Create a graph
const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0],  // cluster 1
  [3, 4], [4, 5], [5, 3],  // cluster 2
  [2, 3],                   // bridge
]);

// Detect communities
const communities = await louvain(graph);
console.log(communities.membership); // [0, 0, 0, 1, 1, 1]
console.log(communities.modularity); // ~0.357

// Compute PageRank
const pr = await pagerank(graph);
console.log(pr.scores); // importance scores per node
```

### Try It

<Playground :code="quickExample" />

## How It Works

graphrs is a TypeScript wrapper around [rust-igraph](https://github.com/Totoro-jam/rust-igraph) (Rust bindings to [igraph](https://igraph.org/)), compiled to WebAssembly. When you call an algorithm function:

1. The WASM module is lazily loaded on first use
2. Your graph data is marshalled to the WASM memory
3. The algorithm runs at native speed inside the WASM sandbox
4. Results are parsed back into typed TypeScript objects

All algorithm functions are `async` because the WASM module loads asynchronously on first call. Subsequent calls are instant.

## Async Patterns

Every algorithm function returns a `Promise`. Here are the common ways to work with them:

### Sequential calls

```typescript
const communities = await louvain(graph);
const pr = await pagerank(graph);
```

### Parallel calls

Run independent algorithms concurrently with `Promise.all`:

```typescript
const [communities, pr, layout] = await Promise.all([
  louvain(graph),
  pagerank(graph),
  layoutFR(graph),
]);
```

### Top-level await

In ESM modules or modern bundlers, use top-level `await`:

```typescript
// app.ts (ESM)
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';

const graph = Graph.fromEdges([[0,1],[1,2],[2,0]]);
const result = await louvain(graph);
```

### In non-async contexts

Wrap in an async IIFE or use `.then()`:

```typescript
(async () => {
  const result = await louvain(graph);
  console.log(result.clusters);
})();
```

## Error Handling

graphrs throws typed errors you can catch and handle:

```typescript
import { Graph, NodeNotFoundError, EdgeNotFoundError } from '@graphrs/core';

const g = new Graph();
g.addNode(0);

try {
  g.neighbors(99); // node 99 doesn't exist
} catch (e) {
  if (e instanceof NodeNotFoundError) {
    console.log(`Node ${e.message} not found`);
  }
}

try {
  g.removeEdge(0, 1); // edge doesn't exist
} catch (e) {
  if (e instanceof EdgeNotFoundError) {
    console.log('Edge not found');
  }
}
```

WASM algorithm errors reject the promise:

```typescript
import { maxFlow } from '@graphrs/flow';

try {
  await maxFlow(graph, 0, 0); // source === target
} catch (e) {
  console.log('Algorithm error:', e.message);
}
```

## Common Patterns

### Build → Analyze → Visualize

The typical workflow: create a graph, run algorithms, then export for rendering.

```typescript
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';
import { layoutFR } from '@graphrs/layout';

// 1. Build the graph
const graph = Graph.fromEdges([
  [0,1],[1,2],[2,0],[3,4],[4,5],[5,3],[2,3],
]);

// 2. Analyze
const [communities, layout] = await Promise.all([
  louvain(graph),
  layoutFR(graph),
]);

// 3. Export for visualization
const g6Data = graph.toG6Format(layout);
// Pass g6Data to your rendering library
```

### Graph from external data

```typescript
// From an API response
const response = await fetch('/api/network');
const { nodes, edges } = await response.json();

const graph = new Graph();
for (const node of nodes) {
  graph.addNode(node.id, node);
}
for (const edge of edges) {
  graph.addEdge(edge.from, edge.to, { weight: edge.weight });
}
```

### Chaining mutations

All mutation methods return `this` for chaining:

```typescript
const graph = new Graph()
  .addNode(0, { label: 'A' })
  .addNode(1, { label: 'B' })
  .addNode(2, { label: 'C' })
  .addEdge(0, 1)
  .addEdge(1, 2)
  .addEdge(2, 0);
```

## Requirements

- **Node.js** >= 20.0.0
- **Browser**: any modern browser with WebAssembly support
- **TypeScript** >= 5.0 (recommended, not required)

## Next Steps

- [Graph Basics](/guide/graph-basics) — Learn how to create and manipulate graphs
- [Algorithms](/guide/algorithms) — Overview of all available algorithm packages
- [Interactive Playground](/examples/playground) — Live demos: force layout, community detection, PageRank, benchmarks
- [Integration Examples](/examples/antv-g6) — Use graphrs with AntV G6, React Flow, Cytoscape.js, D3
