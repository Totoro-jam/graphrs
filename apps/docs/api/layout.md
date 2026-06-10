# @graphrs/layout

Graph layout algorithms for computing node positions. Convert abstract graph topology into 2D coordinates for visualization.

```bash
npm install @graphrs/layout
```

## Force-Directed Layouts

Simulate physical forces (attraction along edges, repulsion between all nodes) to find aesthetically pleasing arrangements.

### `layoutFR(graph, options?)`

Fruchterman-Reingold force-directed layout — the general-purpose default. Produces good results for most graph sizes and topologies.

```typescript
import { Graph } from '@graphrs/core';
import { layoutFR } from '@graphrs/layout';

const graph = Graph.fromEdges([[0,1],[1,2],[2,3],[3,0],[0,2]]);
const result = await layoutFR(graph, { iterations: 500 });
console.log(result.positions); // [[x0, y0], [x1, y1], ...]
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `iterations` | `number` | `500` | Number of simulation steps |

### `layoutKK(graph, options?)`

Kamada-Kawai spring layout — minimizes energy based on graph-theoretic distances. Produces layouts where node positions reflect shortest-path distances.

```typescript
import { layoutKK } from '@graphrs/layout';

const result = await layoutKK(graph);
```

### `layoutGraphopt(graph, options?)`

Graphopt layout — force-directed with a charge-and-spring model. Good alternative to FR for medium-sized graphs.

```typescript
import { layoutGraphopt } from '@graphrs/layout';

const result = await layoutGraphopt(graph, { iterations: 500 });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `iterations` | `number` | `500` | Number of simulation steps |

### `layoutDRL(graph, options?)`

Distributed Recursive Layout — force-directed algorithm designed for very large graphs (10k+ nodes). Uses a multi-level approach for better scalability.

```typescript
import { layoutDRL } from '@graphrs/layout';

const result = await layoutDRL(largeGraph);
```

## Hierarchical Layouts

Arrange nodes in layers to emphasize direction or hierarchy.

### `layoutSugiyama(graph, options?)`

Sugiyama layered layout — the standard algorithm for DAG (directed acyclic graph) visualization. Minimizes edge crossings between layers.

```typescript
import { layoutSugiyama } from '@graphrs/layout';

const result = await layoutSugiyama(graph);
// Nodes arranged in horizontal layers, edges flow downward
```

### `layoutReingoldTilford(graph, options?)`

Reingold-Tilford tree layout — produces clean, compact tree drawings with no edge crossings. Best for tree or near-tree structures.

```typescript
import { layoutReingoldTilford } from '@graphrs/layout';

const result = await layoutReingoldTilford(graph, { root: 0 });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `root` | `number` | `0` | Root node for the tree layout |

## Geometric Layouts

Fixed-pattern arrangements that don't depend on graph structure.

### `layoutCircle(graph)`

Arrange all nodes evenly around a circle. Good for ring topologies and small graphs.

```typescript
import { layoutCircle } from '@graphrs/layout';

const result = await layoutCircle(graph);
```

### `layoutGrid(graph)`

Arrange nodes in a regular grid pattern.

```typescript
import { layoutGrid } from '@graphrs/layout';

const result = await layoutGrid(graph);
```

### `layoutStar(graph)`

Arrange nodes in a star pattern — one node at center, others arranged radially.

```typescript
import { layoutStar } from '@graphrs/layout';

const result = await layoutStar(graph);
```

### `layoutRandom(graph)`

Random positions — useful as a starting point for force-directed refinement.

```typescript
import { layoutRandom } from '@graphrs/layout';

const result = await layoutRandom(graph);
```

## Dimensionality Reduction

### `layoutMDS(graph, options?)`

Multidimensional scaling — positions nodes so that Euclidean distances approximate graph-theoretic distances. Good for revealing global structure.

```typescript
import { layoutMDS } from '@graphrs/layout';

const result = await layoutMDS(graph);
```

## Choosing a Layout

| Algorithm | Type | Speed | Best For |
|-----------|------|-------|----------|
| `layoutFR` | Force-directed | Medium | General-purpose, first try |
| `layoutKK` | Force-directed | Medium | Preserving graph distances |
| `layoutDRL` | Force-directed | Fast | Very large graphs (>10k nodes) |
| `layoutSugiyama` | Hierarchical | Medium | DAGs, workflows, pipelines |
| `layoutReingoldTilford` | Tree | Fast | Trees, org charts |
| `layoutCircle` | Geometric | Instant | Ring topologies, small graphs |
| `layoutGrid` | Geometric | Instant | Regular arrangements |
| `layoutMDS` | Reduction | Slow | Revealing global structure |

## Result Type

All layout functions return `Promise<LayoutResult>`:

```typescript
interface LayoutResult {
  positions: [number, number][];  // [x, y] coordinates per node
}
```

## Using with Visualization Libraries

The layout result feeds directly into graphrs serialization methods:

```typescript
import { Graph } from '@graphrs/core';
import { layoutFR } from '@graphrs/layout';

const graph = Graph.fromEdges([[0,1],[1,2],[2,0]]);
const layout = await layoutFR(graph);

// AntV G6
const g6Data = graph.toG6Format(layout);

// React Flow
const rfData = graph.toReactFlowFormat(layout);

// Cytoscape.js
const cyData = graph.toCytoscapeFormat(layout);
```

Or use the dedicated integration packages for richer features:

```typescript
// @graphrs/g6 — layout + community + centrality pipeline
import { graphrsLayout } from '@graphrs/g6';

// @graphrs/react-flow — React hook with auto-layout
import { useGraphrsLayout } from '@graphrs/react-flow';
```

## API Summary

| Function | Type | Returns |
|----------|------|---------|
| `layoutFR` | Force-directed | `Promise<LayoutResult>` |
| `layoutKK` | Force-directed | `Promise<LayoutResult>` |
| `layoutGraphopt` | Force-directed | `Promise<LayoutResult>` |
| `layoutDRL` | Force-directed | `Promise<LayoutResult>` |
| `layoutSugiyama` | Hierarchical | `Promise<LayoutResult>` |
| `layoutReingoldTilford` | Tree | `Promise<LayoutResult>` |
| `layoutCircle` | Geometric | `Promise<LayoutResult>` |
| `layoutGrid` | Geometric | `Promise<LayoutResult>` |
| `layoutStar` | Geometric | `Promise<LayoutResult>` |
| `layoutRandom` | Geometric | `Promise<LayoutResult>` |
| `layoutMDS` | Reduction | `Promise<LayoutResult>` |
