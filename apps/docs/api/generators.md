# @graphrs/generators

Graph generators for creating synthetic graphs with known properties. Useful for testing algorithms, benchmarking performance, and building simulation networks.

```bash
npm install @graphrs/generators
```

## Random Graph Models

### `erdosRenyi(options)`

Erdos-Renyi random graph (G(n, p) model) — each possible edge exists independently with probability p. The simplest random graph model, widely used in theoretical analysis.

```typescript
import { erdosRenyi } from '@graphrs/generators';

const graph = await erdosRenyi({ n: 100, p: 0.05 });
console.log(graph.nodeCount()); // 100
console.log(graph.edgeCount()); // ~250 (expected: n*(n-1)/2 * p)
```

| Option | Type | Description |
|--------|------|-------------|
| `n` | `number` | Number of nodes |
| `p` | `number` | Edge probability (0 to 1) |
| `directed` | `boolean?` | Create a directed graph |

### `barabasiAlbert(options)`

Barabasi-Albert preferential attachment model — produces scale-free networks where a few nodes become highly connected hubs. Models real-world networks like the web, social networks, and citation graphs.

```typescript
import { barabasiAlbert } from '@graphrs/generators';

const graph = await barabasiAlbert({ n: 1000, m: 3 });
// Produces a power-law degree distribution
```

| Option | Type | Description |
|--------|------|-------------|
| `n` | `number` | Total number of nodes |
| `m` | `number` | Edges added per new node (controls density) |
| `directed` | `boolean?` | Create a directed graph |

### `wattsStrogatz(options)`

Watts-Strogatz small-world network — starts from a ring lattice and rewires edges randomly. Produces graphs with high clustering and short average path lengths, like social networks.

```typescript
import { wattsStrogatz } from '@graphrs/generators';

const graph = await wattsStrogatz({ n: 100, k: 4, p: 0.1 });
```

| Option | Type | Description |
|--------|------|-------------|
| `n` | `number` | Number of nodes |
| `k` | `number` | Each node's neighborhood size (must be even) |
| `p` | `number` | Rewiring probability (0 = ring, 1 = random) |

### `stochasticBlockModel(options)`

Stochastic block model (SBM) — generates graphs with planted community structure. Nodes are divided into blocks, and edge probabilities depend on block membership. Ideal for testing community detection algorithms.

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
// 90 nodes in 3 well-separated communities
```

| Option | Type | Description |
|--------|------|-------------|
| `blockSizes` | `number[]` | Size of each block/community |
| `prefMatrix` | `number[][]` | Edge probability matrix between blocks |

## Deterministic Graphs

Classic graph structures with known topological properties.

### `complete(n, directed?)`

Complete graph K_n — every node connected to every other node. Has n*(n-1)/2 edges (undirected).

```typescript
import { complete } from '@graphrs/generators';

const k10 = await complete(10);
console.log(k10.edgeCount()); // 45
```

### `ring(n)`

Ring (cycle) graph C_n — nodes connected in a circle. Every node has degree 2.

```typescript
import { ring } from '@graphrs/generators';

const cycle = await ring(12);
console.log(cycle.edgeCount()); // 12
```

### `lattice(dims)`

Lattice graph — grid in arbitrary dimensions. Each node connects to its neighbors along each axis.

```typescript
import { lattice } from '@graphrs/generators';

const grid2d = await lattice([10, 10]);    // 100 nodes, 2D grid
const grid3d = await lattice([5, 5, 5]);   // 125 nodes, 3D cube
```

### `star(n)`

Star graph S_n — one center node connected to all n-1 leaf nodes. Center has degree n-1, leaves have degree 1.

```typescript
import { star } from '@graphrs/generators';

const s = await star(10);
console.log(s.degree(0)); // 9 (center node)
```

### `tree(n)`

Random tree with n nodes — connected, acyclic, exactly n-1 edges.

```typescript
import { tree } from '@graphrs/generators';

const t = await tree(50);
console.log(t.edgeCount()); // 49
```

### `path(n)`

Path graph P_n — nodes connected in a line. The simplest connected graph.

```typescript
import { path as pathGraph } from '@graphrs/generators';

const p = await pathGraph(5);
// 0 — 1 — 2 — 3 — 4
```

## Choosing a Generator

| Generator | Properties | Use Case |
|-----------|-----------|----------|
| `erdosRenyi` | Uniform random, Poisson degree distribution | Null model, random baseline |
| `barabasiAlbert` | Scale-free, power-law degree | Web/social network simulation |
| `wattsStrogatz` | Small-world, high clustering | Social network modeling |
| `stochasticBlockModel` | Planted communities | Testing community detection |
| `complete` | Maximum density | Worst-case algorithm testing |
| `ring` | Regular, 2-connected | Symmetry testing |
| `lattice` | Regular, spatial | Grid-based simulations |
| `star` | Maximum centralization | Hub-spoke topology |
| `tree` | Acyclic, minimal connectivity | Tree algorithm testing |
| `path` | Linear, minimal structure | Boundary case testing |

## Complete Example

Generate test graphs and benchmark algorithms:

```typescript
import { erdosRenyi, barabasiAlbert, complete } from '@graphrs/generators';
import { louvain } from '@graphrs/community';
import { pagerank } from '@graphrs/centrality';

// Compare community detection on different topologies
const graphs = await Promise.all([
  erdosRenyi({ n: 200, p: 0.03 }),
  barabasiAlbert({ n: 200, m: 2 }),
  complete(20),
]);

for (const graph of graphs) {
  const communities = await louvain(graph);
  const pr = await pagerank(graph);
  const maxPR = Math.max(...pr.scores);
  console.log(
    `${graph.nodeCount()} nodes, ${graph.edgeCount()} edges: ` +
    `${communities.clusters} communities, max PR=${maxPR.toFixed(4)}`
  );
}
```

## Return Type

All generators return `Promise<Graph>`.
