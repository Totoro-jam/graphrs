# @graphrs

> igraph for JavaScript — comprehensive graph algorithms at native speed.

The graph algorithm library JavaScript never had. 400+ algorithms (community detection, centrality, layout, flow, isomorphism) at native speed via WebAssembly. Works in Browser and Node.js. Zero native dependencies. MIT licensed.

[![CI](https://github.com/Totoro-jam/graphrs/actions/workflows/ci.yml/badge.svg)](https://github.com/Totoro-jam/graphrs/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Why @graphrs?

Python has networkx (pure Python, slow) and igraph (C core, fast).
JavaScript has graphology (pure JS, limited) and... nothing fast.

**@graphrs fills the "igraph for JavaScript" gap** — a comprehensive, high-performance graph analysis library powered by Rust/WASM.

| Capability | graphology | cytoscape.js | **@graphrs** |
|-----------|-----------|-------------|-------------|
| Community detection | 2 | 0 | **10+** |
| Centrality measures | 7 | 2 | **15+** |
| Layout engines | 3 | ext | **16** |
| Network flow | 0 | 0 | **Full** |
| Isomorphism | 0 | 0 | **VF2** |
| 10k nodes PageRank | ~5-10s | N/A | **~100ms** |

## Packages

| Package | Description |
|---------|-------------|
| [`@graphrs/core`](packages/core) | Graph data structure + WASM runtime |
| [`@graphrs/community`](packages/community) | Community detection (Louvain, Leiden, Infomap, ...) |
| [`@graphrs/centrality`](packages/centrality) | Centrality measures (PageRank, betweenness, ...) |
| [`@graphrs/path`](packages/path) | Shortest paths & traversal (Dijkstra, BFS, DFS, ...) |
| [`@graphrs/layout`](packages/layout) | Graph layout algorithms (FR, KK, Sugiyama, ...) |
| [`@graphrs/generators`](packages/generators) | Graph generators (ER, Barabasi-Albert, ...) |
| [`@graphrs/io`](packages/io) | Import/export (GraphML, GML, DOT, edgelist, Pajek) |
| [`@graphrs/operators`](packages/operators) | Graph transforms (union, simplify, reverse, ...) |
| [`@graphrs/flow`](packages/flow) | Network flow & connectivity |
| [`@graphrs/isomorphism`](packages/isomorphism) | Structural matching (VF2, canonical, automorphism) |
| [`@graphrs/g6`](packages/g6) | AntV G6 5.x integration (layout, analysis, adapters) |
| [`@graphrs/react-flow`](packages/react-flow) | React Flow integration (hook, adapters) |

## Quick Start

```bash
npm install @graphrs/core @graphrs/community @graphrs/centrality
```

```typescript
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';
import { pagerank } from '@graphrs/centrality';

// Build a graph
const g = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0],  // cluster 1
  [3, 4], [4, 5], [5, 3],  // cluster 2
  [2, 3],                   // bridge
]);

// Community detection
const communities = await louvain(g);
// { membership: [0,0,0,1,1,1], modularity: 0.357, clusters: 2 }

// Centrality analysis
const pr = await pagerank(g, { damping: 0.85 });
// { scores: [0.12, 0.15, 0.23, 0.18, 0.16, 0.16] }
```

## Framework Integration

```bash
# AntV G6 — plug-and-play layout + analysis
npm install @graphrs/g6 @antv/g6

# React Flow — useGraphrsLayout hook
npm install @graphrs/react-flow @xyflow/react
```

```typescript
// G6: one-line layout registration
import { createGraphrsLayout } from '@graphrs/g6';
new G6Graph({ layout: createGraphrsLayout({ algorithm: 'fruchterman-reingold' }) });

// React Flow: auto-layout hook
import { useGraphrsLayout } from '@graphrs/react-flow';
const { nodes, edges } = useGraphrsLayout(initialNodes, initialEdges);
```

## Use Cases

- **Social network analysis** — community detection, influence propagation
- **Knowledge graphs** — path queries, centrality ranking
- **Visualization** — drop-in layout engine for React Flow / G6 / Cytoscape / D3
- **Supply chain** — flow optimization, bottleneck identification
- **Fraud detection** — subgraph isomorphism, motif census

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Your Application                    │
│  import { Graph } from "@graphrs/core"           │
└───────────────────┬─────────────────────────────┘
                    │  ESM imports (tree-shakable)
┌───────────────────▼─────────────────────────────┐
│         TypeScript Wrapper Layer (MIT)            │
│  Type-safe Graph class, async API, marshalling   │
└───────────────────┬─────────────────────────────┘
                    │  wasm-bindgen glue
┌───────────────────▼─────────────────────────────┐
│          WASM Binary Layer (GPL-2.0)             │
│  Compiled from rust-igraph, lazy-loaded          │
└─────────────────────────────────────────────────┘
```

## Documentation

Full documentation with interactive playground: **[totoro-jam.github.io/graphrs](https://totoro-jam.github.io/graphrs/)**

## Development

```bash
pnpm install          # install dependencies
pnpm turbo build      # build all packages
pnpm turbo test       # run all tests
pnpm turbo typecheck  # type check
pnpm format           # format code
```

## License

The TypeScript wrapper code is [MIT licensed](LICENSE).

This package bundles a WebAssembly binary compiled from [rust-igraph](https://github.com/Totoro-jam/rust-igraph) ([GPL-2.0-or-later](LICENSE-WASM)). The TypeScript wrapper code is original work and is not a derivative of the GPL code.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
