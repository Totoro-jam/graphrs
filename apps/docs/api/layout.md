# @graphrs/layout

Graph layout algorithms for computing node positions.

```bash
npm install @graphrs/layout
```

## Force-Directed Layouts

### `layoutFR(graph, options?)`

Fruchterman-Reingold force-directed layout.

```typescript
import { layoutFR } from '@graphrs/layout';

const result = await layoutFR(graph, { iterations: 500 });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `iterations` | `number` | `500` | Number of iterations |

### `layoutKK(graph, options?)`

Kamada-Kawai spring layout — minimizes energy based on graph-theoretic distances.

```typescript
import { layoutKK } from '@graphrs/layout';

const result = await layoutKK(graph);
```

### `layoutGraphopt(graph, options?)`

Graphopt layout — force-directed with charge and spring model.

```typescript
import { layoutGraphopt } from '@graphrs/layout';

const result = await layoutGraphopt(graph, { iterations: 500 });
```

## Hierarchical Layouts

### `layoutSugiyama(graph, options?)`

Sugiyama layered layout — minimizes edge crossings in directed graphs.

```typescript
import { layoutSugiyama } from '@graphrs/layout';

const result = await layoutSugiyama(graph);
```

### `layoutReingoldTilford(graph, options?)`

Reingold-Tilford tree layout — for tree-like graphs.

```typescript
import { layoutReingoldTilford } from '@graphrs/layout';

const result = await layoutReingoldTilford(graph, { root: 0 });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `root` | `number` | `0` | Root node for the tree |

## Geometric Layouts

### `layoutCircle(graph)`

Arrange nodes in a circle.

### `layoutGrid(graph)`

Arrange nodes in a grid.

### `layoutStar(graph)`

Arrange nodes in a star pattern.

### `layoutRandom(graph)`

Random positions.

## Dimensionality Reduction

### `layoutMDS(graph, options?)`

Multidimensional scaling — preserves graph-theoretic distances.

### `layoutDRL(graph, options?)`

Distributed Recursive Layout — force-directed, good for large graphs.

## Result Type

All layout functions return `Promise<LayoutResult>`:

```typescript
{
  positions: [number, number][],  // [x, y] per node
}
```

Use with visualization serializers:

```typescript
const layout = await layoutFR(graph);
const g6Data = graph.toG6Format(layout);
const rfData = graph.toReactFlowFormat(layout);
const cyData = graph.toCytoscapeFormat(layout);
```
