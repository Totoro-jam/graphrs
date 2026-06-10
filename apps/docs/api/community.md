# @graphrs/community

Community detection algorithms for identifying clusters and groups in graphs. Each algorithm uses a different strategy to partition nodes into communities.

```bash
npm install @graphrs/community
```

## Modularity-Based

Algorithms that optimize modularity — a measure of how well a network decomposes into dense subgroups with sparse connections between them.

### `louvain(graph, options?)`

Louvain method — the most widely used community detection algorithm. Greedily optimizes modularity through iterative node moves and community aggregation. Fast and scalable, but communities may be internally disconnected.

```typescript
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';

const graph = Graph.fromEdges([
  [0,1],[1,2],[2,0],   // cluster A
  [3,4],[4,5],[5,3],   // cluster B
  [2,3],               // bridge
]);

const result = await louvain(graph, { resolution: 1.0 });
console.log(result.membership); // e.g. [0, 0, 0, 1, 1, 1]
console.log(result.modularity); // e.g. 0.357
console.log(result.clusters);   // 2
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `resolution` | `number` | `1.0` | Resolution parameter — higher values produce more, smaller communities |

### `leiden(graph, options?)`

Leiden algorithm — improved version of Louvain that guarantees connected communities. Produces higher-quality partitions by refining communities after each aggregation step. Preferred over Louvain when partition quality matters.

```typescript
import { leiden } from '@graphrs/community';

const result = await leiden(graph, { resolution: 1.0 });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `resolution` | `number` | `1.0` | Resolution parameter |
| `beta` | `number` | — | Randomness parameter for refinement phase |
| `iterations` | `number` | — | Maximum number of iterations |

### `fastGreedy(graph)`

Fast greedy modularity optimization — hierarchical agglomerative approach that merges communities to maximize modularity gain at each step. No tuning parameters needed.

```typescript
import { fastGreedy } from '@graphrs/community';

const result = await fastGreedy(graph);
console.log(result.clusters);   // number of communities found
console.log(result.modularity); // quality score
```

### `spinglass(graph, options?)`

Spinglass algorithm — statistical mechanics approach based on the Potts spin-glass model. Treats community detection as finding the ground state of a spin system. Can detect communities of different sizes but requires a connected graph.

```typescript
import { spinglass } from '@graphrs/community';

const result = await spinglass(graph, { spins: 25 });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `spins` | `number` | `25` | Number of spins (maximum number of communities) |
| `gamma` | `number` | — | Reward/penalty parameter for inter-community edges |

## Information-Theoretic

### `infomap(graph, options?)`

Infomap algorithm — uses the map equation to find the partition that minimizes the description length of a random walk on the graph. Excels at finding flow-based communities. The `modularity` field in the result contains the codelength (description length), not standard modularity.

```typescript
import { infomap } from '@graphrs/community';

const result = await infomap(graph, { trials: 10 });
console.log(result.modularity); // codelength (lower = better partition)
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `trials` | `number` | `10` | Number of optimization trials (more trials = better result, slower) |

## Propagation-Based

Algorithms where labels or fluid spread through the network and stabilize into communities.

### `labelPropagation(graph, options?)`

Label propagation — fast, near-linear-time community detection. Each node adopts the label most common among its neighbors. Non-deterministic: results may vary between runs. The `modularity` field is always 0 (label propagation does not optimize modularity).

```typescript
import { labelPropagation } from '@graphrs/community';

const result = await labelPropagation(graph);
console.log(result.clusters); // number of communities found
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fixed` | `number[]` | — | Node indices whose initial labels are kept fixed |

### `fluidCommunities(graph, options)`

Fluid communities — propagation-based algorithm that simulates interacting fluids to partition the graph into exactly `numCommunities` groups. Unlike most algorithms, the number of communities is specified upfront. The `modularity` field is always 0.

```typescript
import { fluidCommunities } from '@graphrs/community';

const result = await fluidCommunities(graph, { numCommunities: 3 });
console.log(result.clusters); // 3
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `numCommunities` | `number` | required | Exact number of communities to find |

## Random-Walk-Based

### `walktrap(graph, options?)`

Walktrap — detects communities using short random walks. Nodes in the same community tend to have similar random walk transition probabilities. Produces a hierarchical dendrogram and cuts it to maximize modularity.

```typescript
import { walktrap } from '@graphrs/community';

const result = await walktrap(graph, { steps: 4 });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `steps` | `number` | `4` | Random walk length (4–5 works well for most graphs) |

## Choosing an Algorithm

| Algorithm | Strategy | Speed | Tunable | Best For |
|-----------|----------|-------|---------|----------|
| `louvain` | Modularity | Fast | `resolution` | General-purpose, first try |
| `leiden` | Modularity | Fast | `resolution`, `beta` | High-quality partitions |
| `fastGreedy` | Modularity | Fast | None | Quick baseline, no tuning |
| `infomap` | Information theory | Medium | `trials` | Flow-based / directed communities |
| `labelPropagation` | Propagation | Very fast | `fixed` | Very large graphs (>100k nodes) |
| `fluidCommunities` | Propagation | Fast | `numCommunities` | Known number of communities |
| `walktrap` | Random walk | Medium | `steps` | Hierarchical community structure |
| `spinglass` | Statistical mechanics | Slow | `spins`, `gamma` | Small/medium connected graphs |

## Result Type

All functions return `Promise<CommunityResult>`:

```typescript
interface CommunityResult {
  membership: number[];  // community ID for each node (indexed by node order)
  modularity: number;    // quality score (-0.5 to 1.0), or codelength for infomap
  clusters: number;      // number of communities found
}
```

## Complete Example

Compare multiple algorithms on the same graph:

```typescript
import { Graph } from '@graphrs/core';
import {
  louvain, leiden, fastGreedy, infomap,
  labelPropagation, walktrap,
} from '@graphrs/community';

const graph = Graph.fromEdges([
  [0,1],[1,2],[2,0],       // cluster A
  [3,4],[4,5],[5,3],       // cluster B
  [6,7],[7,8],[8,6],       // cluster C
  [2,3],[5,6],             // bridges
]);

const algorithms = [
  { name: 'Louvain',    fn: () => louvain(graph) },
  { name: 'Leiden',     fn: () => leiden(graph) },
  { name: 'FastGreedy', fn: () => fastGreedy(graph) },
  { name: 'Infomap',    fn: () => infomap(graph) },
  { name: 'LabelProp',  fn: () => labelPropagation(graph) },
  { name: 'Walktrap',   fn: () => walktrap(graph) },
];

for (const { name, fn } of algorithms) {
  const result = await fn();
  console.log(
    `${name}: ${result.clusters} communities, ` +
    `modularity=${result.modularity.toFixed(3)}, ` +
    `membership=[${result.membership.join(',')}]`
  );
}
```

## API Summary

| Function | Strategy | Returns |
|----------|----------|---------|
| `louvain` | Modularity optimization | `Promise<CommunityResult>` |
| `leiden` | Improved modularity | `Promise<CommunityResult>` |
| `fastGreedy` | Greedy modularity | `Promise<CommunityResult>` |
| `infomap` | Information theory | `Promise<CommunityResult>` |
| `labelPropagation` | Label propagation | `Promise<CommunityResult>` |
| `fluidCommunities` | Fluid propagation | `Promise<CommunityResult>` |
| `walktrap` | Random walks | `Promise<CommunityResult>` |
| `spinglass` | Spin-glass model | `Promise<CommunityResult>` |
