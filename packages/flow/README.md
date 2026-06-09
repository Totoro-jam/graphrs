# @graphrs/flow

> Network flow and connectivity algorithms.

[![npm](https://img.shields.io/npm/v/@graphrs/flow)](https://www.npmjs.com/package/@graphrs/flow)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Totoro-jam/graphrs/blob/main/LICENSE)

## Install

```bash
npm install @graphrs/core @graphrs/flow
```

## Usage

```typescript
import { Graph } from '@graphrs/core';
import { maxFlow, isConnected } from '@graphrs/flow';

const g = Graph.fromEdges([
  [0, 1], [0, 2], [1, 3], [2, 3],
]);

const result = await maxFlow(g, { source: 0, sink: 3 });
// { value: 2, flow: [...] }

const connected = await isConnected(g);
// true
```

## Functions

| Function | Description |
|----------|-------------|
| `maxFlow(graph, options)` | Maximum flow (Ford-Fulkerson) |
| `minCut(graph, options)` | Minimum cut |
| `vertexConnectivity(graph)` | Vertex connectivity |
| `edgeConnectivity(graph)` | Edge connectivity |
| `isConnected(graph)` | Check graph connectivity |

## Part of @graphrs

[@graphrs](https://github.com/Totoro-jam/graphrs) — modular TypeScript graph library powered by Rust/WASM.

[Full documentation](https://totoro-jam.github.io/graphrs/api/flow) | [GitHub](https://github.com/Totoro-jam/graphrs)
