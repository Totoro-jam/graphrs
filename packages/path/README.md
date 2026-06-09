# @graphrs/path

> Shortest path and graph traversal algorithms.

[![npm](https://img.shields.io/npm/v/@graphrs/path)](https://www.npmjs.com/package/@graphrs/path)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Totoro-jam/graphrs/blob/main/LICENSE)

## Install

```bash
npm install @graphrs/core @graphrs/path
```

## Usage

```typescript
import { Graph } from '@graphrs/core';
import { dijkstra } from '@graphrs/path';

const g = Graph.fromEdges([
  [0, 1], [1, 2], [2, 3], [0, 3],
]);

const result = await dijkstra(g, { source: 0, target: 3 });
// { path: [0, 3], distance: 1 }
```

## Algorithms

| Function | Description |
|----------|-------------|
| `dijkstra(graph, options)` | Dijkstra's shortest path |
| `bellmanFord(graph, options)` | Bellman-Ford (handles negative weights) |
| `bfs(graph, options)` | Breadth-first search |
| `dfs(graph, options)` | Depth-first search |
| `allPairsShortestPaths(graph)` | All-pairs shortest paths |

Functions return `Promise<PathResult>` with `path` and `distance`.

## Part of @graphrs

[@graphrs](https://github.com/Totoro-jam/graphrs) — modular TypeScript graph library powered by Rust/WASM.

[Full documentation](https://totoro-jam.github.io/graphrs/api/path) | [GitHub](https://github.com/Totoro-jam/graphrs)
