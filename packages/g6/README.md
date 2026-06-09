# @graphrs/g6

> AntV G6 5.x integration for @graphrs — layout engines, community detection, and centrality analysis that work directly with G6 data formats.

[![npm](https://img.shields.io/npm/v/@graphrs/g6)](https://www.npmjs.com/package/@graphrs/g6)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Totoro-jam/graphrs/blob/main/LICENSE)

## Install

```bash
npm install @graphrs/g6 @antv/g6
```

## Usage

### Layout

```typescript
import { Graph } from '@antv/g6';
import { createGraphrsLayout } from '@graphrs/g6';

const graph = new Graph({
  container: 'graph-container',
  data: { nodes: [...], edges: [...] },
  layout: createGraphrsLayout({
    algorithm: 'fruchterman-reingold',
    center: [400, 300],
    width: 800,
    height: 600,
  }),
});

graph.render();
```

Available algorithms: `fruchterman-reingold` | `kamada-kawai` | `circle` | `grid` | `star` | `sugiyama` | `random`

### Community Detection

```typescript
import { detectCommunities } from '@graphrs/g6';

const result = await detectCommunities(g6Data, 'louvain');
// result.communities: Map<string, number> — node id → community index
// result.modularity: number
// result.clusterCount: number
```

### Centrality

```typescript
import { computeCentrality } from '@graphrs/g6';

const result = await computeCentrality(g6Data, 'pagerank');
// result.scores: Map<string, number> — node id → score
```

### Adapters

```typescript
import { g6ToGraph, graphToG6, layoutResultToPositions } from '@graphrs/g6';

const { graph, idToIndex, indexToId } = g6ToGraph(g6Data);
const g6Data = graphToG6(graph, indexToId, layoutResult);
```

## Peer Dependencies

- `@graphrs/core` ^0.2.0
- `@graphrs/layout` ^0.2.0
- `@graphrs/community` ^0.2.0
- `@graphrs/centrality` ^0.2.0
- `@antv/g6` >= 5.0.0

## Documentation

[Full API reference](https://totoro-jam.github.io/graphrs/api/g6)

## License

[MIT](https://github.com/Totoro-jam/graphrs/blob/main/LICENSE)
