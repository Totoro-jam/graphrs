# Algorithms

graphrs organizes 400+ graph algorithms into modular packages. Each package is independently installable and tree-shakable.

## Package Overview

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

## Subpath Imports

For finer-grained imports, each package supports subpath exports:

```typescript
// Import from subpath
import { dijkstra } from '@graphrs/path/dijkstra';
import { louvain } from '@graphrs/community';

// Equivalent barrel import
import { dijkstra } from '@graphrs/path';
```
