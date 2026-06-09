# @graphrs/community

> Community detection algorithms for identifying clusters in graphs.

[![npm](https://img.shields.io/npm/v/@graphrs/community)](https://www.npmjs.com/package/@graphrs/community)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Totoro-jam/graphrs/blob/main/LICENSE)

## Install

```bash
npm install @graphrs/core @graphrs/community
```

## Usage

```typescript
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';

const g = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0],  // cluster A
  [3, 4], [4, 5], [5, 3],  // cluster B
  [2, 3],                   // bridge
]);

const result = await louvain(g, { resolution: 1.0 });
// { membership: [0,0,0,1,1,1], modularity: 0.357, clusters: 2 }
```

## Algorithms

| Function | Description |
|----------|-------------|
| `louvain(graph, options?)` | Louvain modularity optimization |
| `leiden(graph, options?)` | Leiden (improved Louvain, guaranteed connected) |
| `infomap(graph, options?)` | Information-theoretic (random walk compression) |
| `labelPropagation(graph)` | Fast near-linear-time detection |
| `walktrap(graph, options?)` | Short random walks |
| `fastGreedy(graph)` | Hierarchical agglomeration |
| `spinglass(graph, options?)` | Statistical mechanics approach |
| `fluidCommunities(graph, options?)` | Propagation-based for k communities |

All functions return `Promise<CommunityResult>` with `membership`, `modularity`, and `clusters`.

## Part of @graphrs

[@graphrs](https://github.com/Totoro-jam/graphrs) — modular TypeScript graph library powered by Rust/WASM.

[Full documentation](https://totoro-jam.github.io/graphrs/api/community) | [GitHub](https://github.com/Totoro-jam/graphrs)
