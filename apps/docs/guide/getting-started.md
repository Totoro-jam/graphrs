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

## How It Works

graphrs is a TypeScript wrapper around [rust-igraph](https://github.com/Totoro-jam/rust-igraph) (Rust bindings to [igraph](https://igraph.org/)), compiled to WebAssembly. When you call an algorithm function:

1. The WASM module is lazily loaded on first use
2. Your graph data is marshalled to the WASM memory
3. The algorithm runs at native speed inside the WASM sandbox
4. Results are parsed back into typed TypeScript objects

All algorithm functions are `async` because the WASM module loads asynchronously on first call. Subsequent calls are instant.

## Requirements

- **Node.js** >= 20.0.0
- **Browser**: any modern browser with WebAssembly support
- **TypeScript** >= 5.0 (recommended, not required)

## Next Steps

- [Graph Basics](/guide/graph-basics) — Learn how to create and manipulate graphs
- [Algorithms](/guide/algorithms) — Overview of all available algorithm packages
- [Integration Examples](/examples/antv-g6) — Use graphrs with popular visualization libraries
