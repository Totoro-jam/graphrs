# @graphrs/operators

> Graph transformation and set operations.

[![npm](https://img.shields.io/npm/v/@graphrs/operators)](https://www.npmjs.com/package/@graphrs/operators)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Totoro-jam/graphrs/blob/main/LICENSE)

## Install

```bash
npm install @graphrs/core @graphrs/operators
```

## Usage

```typescript
import { Graph } from '@graphrs/core';
import { union, simplify, reverse } from '@graphrs/operators';

const g1 = Graph.fromEdges([[0, 1], [1, 2]]);
const g2 = Graph.fromEdges([[2, 3], [3, 4]]);

const merged = await union(g1, g2);
const simplified = await simplify(merged);
```

## Functions

| Function | Description |
|----------|-------------|
| `union(g1, g2)` | Union of two graphs |
| `intersection(g1, g2)` | Intersection |
| `difference(g1, g2)` | Difference |
| `simplify(graph)` | Remove multi-edges and self-loops |
| `reverse(graph)` | Reverse edge directions |
| `toDirected(graph)` | Convert to directed |
| `toUndirected(graph)` | Convert to undirected |
| `inducedSubgraph(graph, nodes)` | Node-induced subgraph |
| `complement(graph)` | Graph complement |

All functions return `Promise<Graph>`.

## Part of @graphrs

[@graphrs](https://github.com/Totoro-jam/graphrs) — modular TypeScript graph library powered by Rust/WASM.

[Full documentation](https://totoro-jam.github.io/graphrs/api/operators) | [GitHub](https://github.com/Totoro-jam/graphrs)
