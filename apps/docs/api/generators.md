# @graphrs/generators

Graph generators for creating synthetic graphs with known properties.

```bash
npm install @graphrs/generators
```

## Random Graphs

### `erdosRenyi(options)`

Erdos-Renyi random graph — each edge exists independently with probability p.

```typescript
import { erdosRenyi } from '@graphrs/generators';

const graph = await erdosRenyi({ n: 100, p: 0.05 });
```

| Option | Type | Description |
|--------|------|-------------|
| `n` | `number` | Number of nodes |
| `p` | `number` | Edge probability (0 to 1) |
| `directed` | `boolean?` | Directed graph |

### `barabasiAlbert(options)`

Barabasi-Albert preferential attachment — produces scale-free networks.

```typescript
import { barabasiAlbert } from '@graphrs/generators';

const graph = await barabasiAlbert({ n: 1000, m: 3 });
```

| Option | Type | Description |
|--------|------|-------------|
| `n` | `number` | Number of nodes |
| `m` | `number` | Edges per new node |
| `directed` | `boolean?` | Directed graph |

### `wattsStrogatz(options)`

Watts-Strogatz small-world network.

```typescript
import { wattsStrogatz } from '@graphrs/generators';

const graph = await wattsStrogatz({ n: 100, k: 4, p: 0.1 });
```

| Option | Type | Description |
|--------|------|-------------|
| `n` | `number` | Number of nodes |
| `k` | `number` | Each node's neighborhood size |
| `p` | `number` | Rewiring probability |

### `stochasticBlockModel(options)`

Stochastic block model — generates graphs with community structure.

```typescript
import { stochasticBlockModel } from '@graphrs/generators';

const graph = await stochasticBlockModel({
  blockSizes: [30, 30, 30],
  prefMatrix: [
    [0.5, 0.01, 0.01],
    [0.01, 0.5, 0.01],
    [0.01, 0.01, 0.5],
  ],
});
```

## Deterministic Graphs

### `complete(n, directed?)`

Complete graph — every node connected to every other.

### `ring(n)`

Ring/cycle graph — nodes connected in a circle.

### `lattice(dims)`

Lattice graph — grid in arbitrary dimensions.

```typescript
import { lattice } from '@graphrs/generators';

const graph2d = await lattice([10, 10]);    // 10x10 grid
const graph3d = await lattice([5, 5, 5]);   // 5x5x5 cube
```

### `star(n)`

Star graph — one center node connected to all others.

### `tree(n)`

Random tree with n nodes.

### `path(n)`

Path graph — nodes connected in a line.

## Return Type

All generators return `Promise<Graph>`.
