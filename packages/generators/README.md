# @graphrs/generators

> Graph generators for creating synthetic graphs.

[![npm](https://img.shields.io/npm/v/@graphrs/generators)](https://www.npmjs.com/package/@graphrs/generators)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Totoro-jam/graphrs/blob/main/LICENSE)

## Install

```bash
npm install @graphrs/core @graphrs/generators
```

## Usage

```typescript
import { erdosRenyi, barabasiAlbert } from '@graphrs/generators';

// Random graph (Erdos-Renyi)
const g1 = await erdosRenyi({ n: 100, p: 0.05 });

// Scale-free graph (Barabasi-Albert)
const g2 = await barabasiAlbert({ n: 100, m: 2 });
```

## Generators

| Function | Description |
|----------|-------------|
| `erdosRenyi(options)` | Erdos-Renyi random graph |
| `barabasiAlbert(options)` | Barabasi-Albert preferential attachment |
| `wattsStrogatz(options)` | Watts-Strogatz small-world |
| `stochasticBlockModel(options)` | Stochastic block model |
| `complete(options)` | Complete graph (K_n) |
| `ring(options)` | Ring / cycle graph |
| `lattice(options)` | Lattice / grid graph |
| `star(options)` | Star graph |
| `tree(options)` | Random tree |
| `path(options)` | Path graph |

All functions return `Promise<Graph>`.

## Part of @graphrs

[@graphrs](https://github.com/Totoro-jam/graphrs) — modular TypeScript graph library powered by Rust/WASM.

[Full documentation](https://totoro-jam.github.io/graphrs/api/generators) | [GitHub](https://github.com/Totoro-jam/graphrs)
