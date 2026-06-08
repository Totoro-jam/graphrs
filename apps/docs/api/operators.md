# @graphrs/operators

Graph transformation and set operations.

```bash
npm install @graphrs/operators
```

## Set Operations

### `union(g1, g2)`

Graph union — combines nodes and edges from both graphs.

```typescript
import { union } from '@graphrs/operators';

const result = await union(graph1, graph2);
```

### `intersection(g1, g2)`

Graph intersection — keeps only shared edges.

```typescript
import { intersection } from '@graphrs/operators';

const result = await intersection(graph1, graph2);
```

### `difference(g1, g2)`

Graph difference — edges in g1 but not in g2.

```typescript
import { difference } from '@graphrs/operators';

const result = await difference(graph1, graph2);
```

## Transforms

### `simplify(graph)`

Remove self-loops and multi-edges.

```typescript
import { simplify } from '@graphrs/operators';

const result = await simplify(graph);
```

### `reverse(graph)`

Reverse all edge directions (directed graphs).

```typescript
import { reverse } from '@graphrs/operators';

const result = await reverse(directedGraph);
```

### `toDirected(graph)`

Convert undirected graph to directed (each edge becomes two directed edges).

```typescript
import { toDirected } from '@graphrs/operators';

const directed = await toDirected(undirectedGraph);
```

### `toUndirected(graph)`

Convert directed graph to undirected.

```typescript
import { toUndirected } from '@graphrs/operators';

const undirected = await toUndirected(directedGraph);
```

## Subgraph Operations

### `inducedSubgraph(graph, nodeIds)`

Extract the induced subgraph for given node IDs.

```typescript
import { inducedSubgraph } from '@graphrs/operators';

const sub = await inducedSubgraph(graph, [0, 1, 2]);
```

### `complement(graph)`

Graph complement — edges become non-edges and vice versa.

```typescript
import { complement } from '@graphrs/operators';

const result = await complement(graph);
```

## Return Type

All functions return `Promise<Graph>`.
