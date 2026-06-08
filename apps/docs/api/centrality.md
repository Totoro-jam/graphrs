# @graphrs/centrality

Centrality measures for ranking node importance in graphs.

```bash
npm install @graphrs/centrality
```

## Functions

### `pagerank(graph, options?)`

Google's PageRank algorithm. Measures node importance based on incoming link structure.

```typescript
import { pagerank } from '@graphrs/centrality';

const result = await pagerank(graph, { damping: 0.85 });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `damping` | `number` | `0.85` | Damping factor |

### `betweenness(graph, options?)`

Betweenness centrality — measures how often a node lies on shortest paths.

```typescript
import { betweenness } from '@graphrs/centrality';

const result = await betweenness(graph, { directed: false });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `directed` | `boolean` | graph's value | Treat as directed |

### `closeness(graph, options?)`

Closeness centrality — measures average distance to all other nodes.

```typescript
import { closeness } from '@graphrs/centrality';

const result = await closeness(graph, { normalized: true });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `normalized` | `boolean` | `true` | Normalize scores |

### `eigenvector(graph, options?)`

Eigenvector centrality — measures influence based on neighbor importance.

```typescript
import { eigenvector } from '@graphrs/centrality';

const result = await eigenvector(graph);
```

### `hits(graph, options?)`

HITS (Hyperlink-Induced Topic Search) — computes hub and authority scores.

```typescript
import { hits } from '@graphrs/centrality';

const result = await hits(graph);
// result: HitsResult { hubs: number[], authorities: number[] }
```

**Returns**: `HitsResult` (extends `CentralityResult`)

### `katz(graph, options?)`

Katz centrality — measures influence with attenuation factor.

```typescript
import { katz } from '@graphrs/centrality';

const result = await katz(graph, { alpha: 0.1 });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `alpha` | `number` | `0.1` | Attenuation factor |

### `harmonic(graph, options?)`

Harmonic centrality — variant of closeness using harmonic mean of distances.

```typescript
import { harmonic } from '@graphrs/centrality';

const result = await harmonic(graph);
```

## Result Type

Most functions return `Promise<CentralityResult>`:

```typescript
{
  scores: number[],  // centrality score per node
}
```
