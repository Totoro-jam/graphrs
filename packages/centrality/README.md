# @graphrs/centrality

> Centrality measures for ranking node importance in graphs.

[![npm](https://img.shields.io/npm/v/@graphrs/centrality)](https://www.npmjs.com/package/@graphrs/centrality)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Totoro-jam/graphrs/blob/main/LICENSE)

## Install

```bash
npm install @graphrs/core @graphrs/centrality
```

## Usage

```typescript
import { Graph } from '@graphrs/core';
import { pagerank } from '@graphrs/centrality';

const g = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0], [2, 3],
]);

const result = await pagerank(g, { damping: 0.85 });
// { scores: [0.21, 0.28, 0.30, 0.21] }
```

## Algorithms

| Function | Description |
|----------|-------------|
| `pagerank(graph, options?)` | PageRank (link-based importance) |
| `betweenness(graph, options?)` | Betweenness (shortest-path broker) |
| `closeness(graph, options?)` | Closeness (average distance) |
| `eigenvector(graph)` | Eigenvector (neighbor influence) |
| `hits(graph)` | HITS (hub & authority scores) |
| `katz(graph, options?)` | Katz (attenuated walk counts) |
| `harmonic(graph)` | Harmonic (harmonic mean distance) |

Most functions return `Promise<CentralityResult>` with `scores: number[]`.

## Part of @graphrs

[@graphrs](https://github.com/Totoro-jam/graphrs) — modular TypeScript graph library powered by Rust/WASM.

[Full documentation](https://totoro-jam.github.io/graphrs/api/centrality) | [GitHub](https://github.com/Totoro-jam/graphrs)
