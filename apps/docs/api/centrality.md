# @graphrs/centrality

Centrality measures for ranking node importance in graphs. Each algorithm captures a different notion of what makes a node "important."

```bash
npm install @graphrs/centrality
```

## Functions

### `pagerank(graph, options?)`

Google's PageRank algorithm. Measures node importance based on incoming link structure — a node is important if it is linked to by other important nodes.

```typescript
import { Graph } from '@graphrs/core';
import { pagerank } from '@graphrs/centrality';

const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0], [2, 3],
]);

const result = await pagerank(graph, { damping: 0.85 });
console.log(result.scores); // importance score per node
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `damping` | `number` | `0.85` | Probability of following a link vs random jump |
| `iterations` | `number` | — | Maximum iterations |
| `tolerance` | `number` | — | Convergence threshold |

### `betweenness(graph, options?)`

Betweenness centrality — measures how often a node lies on shortest paths between other nodes. High betweenness nodes are "bridges" or "brokers" that control information flow.

```typescript
import { betweenness } from '@graphrs/centrality';

const result = await betweenness(graph, { directed: false });
console.log(result.scores); // betweenness score per node
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `directed` | `boolean` | graph's value | Treat edges as directed |
| `normalized` | `boolean` | — | Normalize scores to [0, 1] |

### `closeness(graph, options?)`

Closeness centrality — measures how close a node is to all other nodes. Defined as the inverse of the average shortest-path distance. Nodes with high closeness can reach all others quickly.

```typescript
import { closeness } from '@graphrs/centrality';

const result = await closeness(graph, { normalized: true });
console.log(result.scores); // closeness score per node
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `normalized` | `boolean` | `true` | Normalize by (n-1) |

### `eigenvector(graph, options?)`

Eigenvector centrality — measures influence by accounting for the importance of neighbors. A node is important if it is connected to other important nodes (the self-referential definition that PageRank relaxes).

```typescript
import { eigenvector } from '@graphrs/centrality';

const result = await eigenvector(graph);
console.log(result.scores);
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `scale` | `boolean` | — | Scale the result |

### `hits(graph, options?)`

HITS (Hyperlink-Induced Topic Search) — computes two scores per node: **hub** (links to good authorities) and **authority** (linked to by good hubs). Designed for directed link analysis.

```typescript
import { hits } from '@graphrs/centrality';

const result = await hits(graph);
console.log(result.hubs);        // hub scores
console.log(result.authorities); // authority scores
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `iterations` | `number` | — | Maximum iterations |
| `tolerance` | `number` | — | Convergence threshold |

**Returns:** `Promise<HitsResult>` (different from other centrality functions)

```typescript
interface HitsResult {
  hubs: number[];        // hub score per node
  authorities: number[]; // authority score per node
}
```

### `katz(graph, options?)`

Katz centrality — measures influence by counting all paths from a node, with longer paths attenuated by a factor α. Generalizes degree centrality.

```typescript
import { katz } from '@graphrs/centrality';

const result = await katz(graph, { alpha: 0.1 });
console.log(result.scores);
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `alpha` | `number` | `0.1` | Attenuation factor (must be < 1/λ₁) |
| `beta` | `number` | — | Weight of the exogenous factor |

### `harmonic(graph, options?)`

Harmonic centrality — variant of closeness that uses the harmonic mean of distances instead of the arithmetic mean. Handles disconnected graphs gracefully (unreachable nodes contribute 0 instead of making the score undefined).

```typescript
import { harmonic } from '@graphrs/centrality';

const result = await harmonic(graph);
console.log(result.scores);
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `normalized` | `boolean` | — | Normalize scores |

## Result Type

Most functions return `Promise<CentralityResult>`:

```typescript
interface CentralityResult {
  scores: number[];  // centrality score per node (indexed by node order)
}
```

Exception: `hits()` returns `HitsResult` with separate `hubs` and `authorities` arrays.

## Complete Example

Compare multiple centrality measures to understand node roles:

```typescript
import { Graph } from '@graphrs/core';
import { pagerank, betweenness, closeness } from '@graphrs/centrality';

const graph = Graph.fromEdges([
  [0,1],[1,2],[2,0],   // cluster A
  [3,4],[4,5],[5,3],   // cluster B
  [2,3],               // bridge
]);

const [pr, bw, cl] = await Promise.all([
  pagerank(graph),
  betweenness(graph),
  closeness(graph),
]);

graph.nodes().forEach((id, i) => {
  console.log(
    `Node ${id}: PR=${pr.scores[i]!.toFixed(3)}, ` +
    `BW=${bw.scores[i]!.toFixed(3)}, CL=${cl.scores[i]!.toFixed(3)}`
  );
});
// Nodes 2 and 3 will have highest betweenness (bridge nodes)
```

## API Summary

| Function | Returns | Best For |
|----------|---------|----------|
| `pagerank` | `CentralityResult` | Global ranking by influence |
| `betweenness` | `CentralityResult` | Finding bridges and bottlenecks |
| `closeness` | `CentralityResult` | Finding nodes with shortest reach |
| `eigenvector` | `CentralityResult` | Nodes connected to important nodes |
| `hits` | `HitsResult` | Directed link analysis (hubs & authorities) |
| `katz` | `CentralityResult` | Long-range influence with attenuation |
| `harmonic` | `CentralityResult` | Closeness for disconnected graphs |
