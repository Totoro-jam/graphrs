# @graphrs/isomorphism

> Graph isomorphism and structural matching algorithms.

[![npm](https://img.shields.io/npm/v/@graphrs/isomorphism)](https://www.npmjs.com/package/@graphrs/isomorphism)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Totoro-jam/graphrs/blob/main/LICENSE)

## Install

```bash
npm install @graphrs/core @graphrs/isomorphism
```

## Usage

```typescript
import { Graph } from '@graphrs/core';
import { isIsomorphic } from '@graphrs/isomorphism';

const g1 = Graph.fromEdges([[0, 1], [1, 2], [2, 0]]);
const g2 = Graph.fromEdges([[3, 4], [4, 5], [5, 3]]);

const result = await isIsomorphic(g1, g2);
// true — same structure, different labels
```

## Functions

| Function | Description |
|----------|-------------|
| `isIsomorphic(g1, g2)` | Check if two graphs are isomorphic (VF2) |
| `subgraphIsomorphic(g1, g2)` | Check subgraph isomorphism |
| `canonicalPermutation(graph)` | Canonical node ordering |
| `automorphismGroupSize(graph)` | Size of automorphism group |

## Part of @graphrs

[@graphrs](https://github.com/Totoro-jam/graphrs) — modular TypeScript graph library powered by Rust/WASM.

[Full documentation](https://totoro-jam.github.io/graphrs/api/isomorphism) | [GitHub](https://github.com/Totoro-jam/graphrs)
