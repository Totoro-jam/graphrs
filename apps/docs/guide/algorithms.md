# Algorithms

graphrs organizes 400+ graph algorithms into modular packages. Each package is independently installable and tree-shakable.

## Package Overview

### Algorithm Packages

| Package | Description | Functions |
|---------|-------------|-----------|
| [`@graphrs/community`](/api/community) | Community detection | louvain, leiden, infomap, labelPropagation, walktrap, fastGreedy, spinglass, fluidCommunities |
| [`@graphrs/centrality`](/api/centrality) | Centrality measures | pagerank, betweenness, closeness, eigenvector, hits, katz, harmonic |
| [`@graphrs/path`](/api/path) | Shortest paths & traversal | dijkstra, bellmanFord, bfs, dfs, allPairsShortestPaths |
| [`@graphrs/layout`](/api/layout) | Graph layout | layoutFR, layoutKK, layoutGraphopt, layoutSugiyama, layoutReingoldTilford, layoutCircle, layoutGrid, layoutStar, layoutRandom, layoutMDS, layoutDRL |
| [`@graphrs/generators`](/api/generators) | Graph generators | erdosRenyi, barabasiAlbert, wattsStrogatz, stochasticBlockModel, complete, ring, lattice, star, tree, path |
| [`@graphrs/io`](/api/io) | Import/export | readGraphML, writeGraphML, readGML, writeGML, readDOT, writeDOT, readEdgeList, writeEdgeList, readPajek, writePajek |
| [`@graphrs/operators`](/api/operators) | Graph transforms | union, intersection, difference, simplify, reverse, toDirected, toUndirected, inducedSubgraph, complement |
| [`@graphrs/flow`](/api/flow) | Network flow | maxFlow, minCut, vertexConnectivity, edgeConnectivity, isConnected |
| [`@graphrs/isomorphism`](/api/isomorphism) | Structural matching | isIsomorphic, subgraphIsomorphic, canonicalPermutation, automorphismGroupSize |

### Integration Packages

| Package | Description | What it does |
|---------|-------------|--------------|
| [`@graphrs/g6`](/api/g6) | AntV G6 adapter | Provides G6-compatible layout functions, community coloring, and centrality sizing |
| [`@graphrs/react-flow`](/api/react-flow) | React Flow adapter | `useGraphrsLayout` hook for auto-positioning React Flow nodes |

## Choosing the Right Algorithm

### Community Detection

| Algorithm | Speed | Quality | Best For |
|-----------|-------|---------|----------|
| `louvain` | Fast | Good | General-purpose, first try |
| `leiden` | Fast | Best | When you need guaranteed connected communities |
| `labelPropagation` | Fastest | Variable | Very large graphs (>100k nodes) |
| `infomap` | Medium | Best | Information flow / routing networks |
| `walktrap` | Medium | Good | Small-medium graphs with clear structure |
| `fastGreedy` | Fast | Good | Hierarchical community structure |
| `spinglass` | Slow | Good | When you need precise control (spin count) |
| `fluidCommunities` | Fast | Variable | When you know `k` (number of communities) in advance |

### Centrality Measures

| Algorithm | Measures | Best For |
|-----------|----------|----------|
| `pagerank` | Global importance | Ranking nodes by influence (web, social) |
| `betweenness` | Bridge / broker role | Finding bottlenecks and brokers |
| `closeness` | Distance to all others | Finding nodes with fastest access |
| `eigenvector` | Neighbor importance | Nodes connected to important nodes |
| `hits` | Hub / authority scores | Directed networks (web link analysis) |
| `katz` | Attenuated walk count | Networks with long-range influence |
| `harmonic` | Harmonic mean distance | Disconnected graphs (graceful fallback) |

### Layout Algorithms

| Algorithm | Type | Best For |
|-----------|------|----------|
| `layoutFR` | Force-directed | General-purpose visualization |
| `layoutKK` | Force-directed | Emphasizing shortest-path distances |
| `layoutSugiyama` | Layered | DAGs, hierarchies, workflows |
| `layoutReingoldTilford` | Tree | Tree structures |
| `layoutCircle` | Geometric | Ring/cycle topologies |
| `layoutGrid` | Geometric | Uniform arrangement |
| `layoutDRL` | Force-directed | Very large graphs (>10k nodes) |

## Common Pattern

Every algorithm function follows the same pattern:

```typescript
import { Graph } from '@graphrs/core';
import { someAlgorithm } from '@graphrs/some-package';

const graph = Graph.fromEdges([[0, 1], [1, 2], [2, 0]]);

// All algorithm functions are async
const result = await someAlgorithm(graph, {
  // optional typed options
});
```

### Rules

1. **First argument** is always a `Graph` instance
2. **Second argument** is an optional typed options object
3. **Return value** is always a `Promise` of a typed result
4. **WASM loading** is handled automatically on first call

## Result Types

Each algorithm family returns a specific result type:

```typescript
// Community detection → CommunityResult
{ membership: number[], modularity: number, clusters: number }

// Centrality measures → CentralityResult
{ scores: number[] }

// Shortest path → PathResult
{ path: number[], distance: number }

// Layout → LayoutResult
{ positions: [number, number][] }

// Network flow → FlowResult
{ value: number, flow: number[] }
```

## Async Behavior

All algorithm functions are `async` because the WASM module loads lazily:

```typescript
// First call: loads WASM (~1-2ms), then runs algorithm
const result1 = await pagerank(graph);

// Subsequent calls: WASM already loaded, runs immediately
const result2 = await betweenness(graph);
```

The WASM module is a singleton — it loads once and is reused across all packages.

## Combining Algorithms

A common pattern is chaining multiple algorithms for a full analysis pipeline:

```typescript
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';
import { pagerank } from '@graphrs/centrality';
import { layoutFR } from '@graphrs/layout';

const graph = Graph.fromEdges([
  [0,1],[1,2],[2,0],
  [3,4],[4,5],[5,3],
  [2,3],
]);

// Run in parallel — they're independent
const [communities, pr, layout] = await Promise.all([
  louvain(graph),
  pagerank(graph),
  layoutFR(graph),
]);

// Combine for visualization
const nodes = graph.nodes().map((id, i) => ({
  id,
  x: layout.positions[i]![0],
  y: layout.positions[i]![1],
  community: communities.membership[i],
  importance: pr.scores[i],
}));
```

## Subpath Imports

For finer-grained imports, each package supports subpath exports:

```typescript
// Import from subpath
import { dijkstra } from '@graphrs/path/dijkstra';
import { louvain } from '@graphrs/community';

// Equivalent barrel import
import { dijkstra } from '@graphrs/path';
```
