# @graphrs/core

> Graph data structure, WASM runtime, and shared types for the @graphrs ecosystem.

[![npm](https://img.shields.io/npm/v/@graphrs/core)](https://www.npmjs.com/package/@graphrs/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Totoro-jam/graphrs/blob/main/LICENSE)

## Install

```bash
npm install @graphrs/core
```

## Usage

```typescript
import { Graph } from '@graphrs/core';

// Create from edge list
const g = Graph.fromEdges([
  [0, 1], [1, 2], [2, 3], [3, 0],
]);

console.log(g.nodeCount()); // 4
console.log(g.edgeCount()); // 4
console.log(g.neighbors(0)); // [1, 3]

// Serialize for visualization libraries
const g6Data = g.toG6Format();
const rfData = g.toReactFlowFormat();
const cyData = g.toCytoscapeFormat();
```

## API

### Graph Class

- `new Graph(directed?)` — create empty graph
- `Graph.fromEdges(edges, options?)` — from `[source, target][]`
- `Graph.fromAdjacencyMatrix(matrix, options?)` — from adjacency matrix
- `Graph.fromJSON(data)` — from serialized JSON

### Instance Methods

| Method | Description |
|--------|-------------|
| `addNode(id, data?)` | Add a node |
| `addEdge(source, target, data?)` | Add an edge |
| `removeNode(id)` | Remove node and its edges |
| `removeEdge(source, target)` | Remove an edge |
| `nodeCount()` / `edgeCount()` | Count nodes/edges |
| `hasNode(id)` / `hasEdge(s, t)` | Check existence |
| `neighbors(id)` | Adjacent node IDs |
| `degree(id)` | Number of adjacent edges |
| `nodes()` / `edges()` | List all |
| `subgraph(nodeIds)` | Extract subgraph |
| `toJSON()` | Serialize |
| `toG6Format(layout?)` | AntV G6 format |
| `toReactFlowFormat(layout?)` | React Flow format |
| `toCytoscapeFormat(layout?)` | Cytoscape.js format |

## Part of @graphrs

This is the core package of [@graphrs](https://github.com/Totoro-jam/graphrs) — a modular TypeScript graph library powered by Rust/WASM with 400+ algorithms.

[Full documentation](https://totoro-jam.github.io/graphrs/) | [GitHub](https://github.com/Totoro-jam/graphrs)
