# @graphrs/community

Community detection algorithms for identifying clusters and groups in graphs.

```bash
npm install @graphrs/community
```

## Functions

### `louvain(graph, options?)`

Louvain method for community detection. Optimizes modularity greedily.

```typescript
import { louvain } from '@graphrs/community';

const result = await louvain(graph, { resolution: 1.0 });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `resolution` | `number` | `1.0` | Resolution parameter (higher = more communities) |

**Returns**: `CommunityResult`

### `leiden(graph, options?)`

Leiden algorithm — improved version of Louvain with guaranteed connected communities.

```typescript
import { leiden } from '@graphrs/community';

const result = await leiden(graph, { resolution: 1.0 });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `resolution` | `number` | `1.0` | Resolution parameter |

### `infomap(graph, options?)`

Infomap algorithm — uses information-theoretic approach (random walk compression).

```typescript
import { infomap } from '@graphrs/community';

const result = await infomap(graph, { trials: 10 });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `trials` | `number` | `10` | Number of optimization trials |

### `labelPropagation(graph, options?)`

Label propagation — fast, near-linear-time community detection.

```typescript
import { labelPropagation } from '@graphrs/community';

const result = await labelPropagation(graph);
```

### `walktrap(graph, options?)`

Walktrap — detects communities using short random walks.

```typescript
import { walktrap } from '@graphrs/community';

const result = await walktrap(graph, { steps: 4 });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `steps` | `number` | `4` | Random walk length |

### `fastGreedy(graph)`

Fast greedy modularity optimization — hierarchical agglomeration.

```typescript
import { fastGreedy } from '@graphrs/community';

const result = await fastGreedy(graph);
```

### `spinglass(graph, options?)`

Spinglass algorithm — statistical mechanics approach.

```typescript
import { spinglass } from '@graphrs/community';

const result = await spinglass(graph, { spins: 25 });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `spins` | `number` | `25` | Number of spins |

### `fluidCommunities(graph, options?)`

Fluid communities — propagation-based algorithm for k communities.

```typescript
import { fluidCommunities } from '@graphrs/community';

const result = await fluidCommunities(graph, { k: 3 });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `k` | `number` | required | Number of communities |

## Result Type

All functions return `Promise<CommunityResult>`:

```typescript
{
  membership: number[],  // community assignment per node
  modularity: number,    // quality score (-0.5 to 1.0)
  clusters: number,      // number of communities found
}
```
