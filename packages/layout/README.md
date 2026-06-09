# @graphrs/layout

> Graph layout algorithms for spatial positioning of nodes.

[![npm](https://img.shields.io/npm/v/@graphrs/layout)](https://www.npmjs.com/package/@graphrs/layout)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Totoro-jam/graphrs/blob/main/LICENSE)

## Install

```bash
npm install @graphrs/core @graphrs/layout
```

## Usage

```typescript
import { Graph } from '@graphrs/core';
import { layoutFR } from '@graphrs/layout';

const g = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0], [2, 3],
]);

const result = await layoutFR(g);
// { positions: [[x0,y0], [x1,y1], [x2,y2], [x3,y3]] }

// Use with visualization
const g6Data = g.toG6Format(result);
```

## Algorithms

| Function | Description |
|----------|-------------|
| `layoutFR(graph, options?)` | Fruchterman-Reingold (force-directed) |
| `layoutKK(graph, options?)` | Kamada-Kawai (spring model) |
| `layoutGraphopt(graph, options?)` | Graphopt (force-directed) |
| `layoutSugiyama(graph, options?)` | Sugiyama (layered, for DAGs) |
| `layoutReingoldTilford(graph, options?)` | Reingold-Tilford (tree layout) |
| `layoutCircle(graph)` | Circular layout |
| `layoutGrid(graph, options?)` | Grid layout |
| `layoutStar(graph, options?)` | Star layout |
| `layoutRandom(graph)` | Random positions |
| `layoutMDS(graph)` | Multidimensional scaling |
| `layoutDRL(graph, options?)` | Distributed Recursive Layout |

All functions return `Promise<LayoutResult>` with `positions: [number, number][]`.

## Part of @graphrs

[@graphrs](https://github.com/Totoro-jam/graphrs) — modular TypeScript graph library powered by Rust/WASM.

[Full documentation](https://totoro-jam.github.io/graphrs/api/layout) | [GitHub](https://github.com/Totoro-jam/graphrs)
