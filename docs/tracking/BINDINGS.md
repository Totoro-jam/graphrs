# @graphrs Binding Tracker

Status of each algorithm's WASM binding. Updated by `/bwu-start` and `/bwu-finish`.

Status: `todo` | `wip` | `test` | `review` | `done` | `blocked`

---

## Community Detection (`@graphrs/community`)

| BWU ID | Algorithm | Function | Status | Date |
|--------|-----------|----------|--------|------|
| BWU-COM-001 | Louvain | `louvain` | done | 2026-06-08 |
| BWU-COM-002 | Leiden | `leiden` | done | 2026-06-08 |
| BWU-COM-003 | Infomap | `infomap` | done | 2026-06-08 |
| BWU-COM-004 | Label Propagation | `labelPropagation` | done | 2026-06-08 |
| BWU-COM-005 | Walktrap | `walktrap` | done | 2026-06-08 |
| BWU-COM-006 | Fast Greedy | `fastGreedy` | done | 2026-06-08 |
| BWU-COM-007 | Spinglass | `spinglass` | done | 2026-06-08 |
| BWU-COM-008 | Fluid Communities | `fluidCommunities` | done | 2026-06-08 |

## Centrality (`@graphrs/centrality`)

| BWU ID | Algorithm | Function | Status | Date |
|--------|-----------|----------|--------|------|
| BWU-CEN-001 | PageRank | `pagerank` | done | 2026-06-08 |
| BWU-CEN-002 | Betweenness | `betweenness` | done | 2026-06-08 |
| BWU-CEN-003 | Closeness | `closeness` | done | 2026-06-08 |
| BWU-CEN-004 | Eigenvector | `eigenvector` | done | 2026-06-08 |
| BWU-CEN-005 | HITS | `hits` | done | 2026-06-08 |
| BWU-CEN-006 | Katz | `katz` | done | 2026-06-08 |
| BWU-CEN-007 | Harmonic | `harmonic` | done | 2026-06-08 |

## Path (`@graphrs/path`)

| BWU ID | Algorithm | Function | Status | Date |
|--------|-----------|----------|--------|------|
| BWU-PTH-001 | Dijkstra | `dijkstra` | done | 2026-06-08 |
| BWU-PTH-002 | Bellman-Ford | `bellmanFord` | done | 2026-06-08 |
| BWU-PTH-003 | BFS | `bfs` | done | 2026-06-08 |
| BWU-PTH-004 | DFS | `dfs` | done | 2026-06-08 |
| BWU-PTH-005 | All Pairs SP | `allPairsShortestPaths` | done | 2026-06-08 |

## Layout (`@graphrs/layout`)

| BWU ID | Algorithm | Function | Status | Date |
|--------|-----------|----------|--------|------|
| BWU-LAY-001 | Fruchterman-Reingold | `layoutFR` | done | 2026-06-08 |
| BWU-LAY-002 | Kamada-Kawai | `layoutKK` | done | 2026-06-08 |
| BWU-LAY-003 | Graphopt | `layoutGraphopt` | done | 2026-06-08 |
| BWU-LAY-004 | Sugiyama | `layoutSugiyama` | done | 2026-06-08 |
| BWU-LAY-005 | Reingold-Tilford | `layoutReingoldTilford` | done | 2026-06-08 |
| BWU-LAY-006 | Circle | `layoutCircle` | done | 2026-06-08 |
| BWU-LAY-007 | Grid | `layoutGrid` | done | 2026-06-08 |
| BWU-LAY-008 | Star | `layoutStar` | done | 2026-06-08 |
| BWU-LAY-009 | Random | `layoutRandom` | done | 2026-06-08 |
| BWU-LAY-010 | MDS | `layoutMDS` | done | 2026-06-08 |
| BWU-LAY-011 | DRL | `layoutDRL` | done | 2026-06-08 |

## Generators (`@graphrs/generators`)

| BWU ID | Algorithm | Function | Status | Date |
|--------|-----------|----------|--------|------|
| BWU-GEN-001 | Erdos-Renyi | `erdosRenyi` | done | 2026-06-08 |
| BWU-GEN-002 | Barabasi-Albert | `barabasiAlbert` | done | 2026-06-08 |
| BWU-GEN-003 | Watts-Strogatz | `wattsStrogatz` | done | 2026-06-08 |
| BWU-GEN-004 | Stochastic Block Model | `stochasticBlockModel` | done | 2026-06-08 |
| BWU-GEN-005 | Complete | `complete` | done | 2026-06-08 |
| BWU-GEN-006 | Ring | `ring` | done | 2026-06-08 |
| BWU-GEN-007 | Lattice | `lattice` | done | 2026-06-08 |
| BWU-GEN-008 | Star | `star` | done | 2026-06-08 |
| BWU-GEN-009 | Tree | `tree` | done | 2026-06-08 |
| BWU-GEN-010 | Path | `path` | done | 2026-06-08 |

## I/O (`@graphrs/io`)

| BWU ID | Algorithm | Function | Status | Date |
|--------|-----------|----------|--------|------|
| BWU-IO-001 | GraphML Read | `readGraphML` | done | 2026-06-08 |
| BWU-IO-002 | GraphML Write | `writeGraphML` | done | 2026-06-08 |
| BWU-IO-003 | GML Read | `readGML` | done | 2026-06-08 |
| BWU-IO-004 | GML Write | `writeGML` | done | 2026-06-08 |
| BWU-IO-005 | DOT Read | `readDOT` | done | 2026-06-08 |
| BWU-IO-006 | DOT Write | `writeDOT` | done | 2026-06-08 |
| BWU-IO-007 | Edge List Read | `readEdgeList` | done | 2026-06-08 |
| BWU-IO-008 | Edge List Write | `writeEdgeList` | done | 2026-06-08 |
| BWU-IO-009 | Pajek Read | `readPajek` | done | 2026-06-08 |
| BWU-IO-010 | Pajek Write | `writePajek` | done | 2026-06-08 |

## Operators (`@graphrs/operators`)

| BWU ID | Algorithm | Function | Status | Date |
|--------|-----------|----------|--------|------|
| BWU-OPS-001 | Union | `union` | done | 2026-06-08 |
| BWU-OPS-002 | Intersection | `intersection` | done | 2026-06-08 |
| BWU-OPS-003 | Difference | `difference` | done | 2026-06-08 |
| BWU-OPS-004 | Simplify | `simplify` | done | 2026-06-08 |
| BWU-OPS-005 | Reverse | `reverse` | done | 2026-06-08 |
| BWU-OPS-006 | To Directed | `toDirected` | done | 2026-06-08 |
| BWU-OPS-007 | To Undirected | `toUndirected` | done | 2026-06-08 |
| BWU-OPS-008 | Induced Subgraph | `inducedSubgraph` | done | 2026-06-08 |
| BWU-OPS-009 | Complement | `complement` | done | 2026-06-08 |

## Flow (`@graphrs/flow`)

| BWU ID | Algorithm | Function | Status | Date |
|--------|-----------|----------|--------|------|
| BWU-FLW-001 | Max Flow | `maxFlow` | done | 2026-06-08 |
| BWU-FLW-002 | Min Cut | `minCut` | done | 2026-06-08 |
| BWU-FLW-003 | Vertex Connectivity | `vertexConnectivity` | done | 2026-06-08 |
| BWU-FLW-004 | Edge Connectivity | `edgeConnectivity` | done | 2026-06-08 |
| BWU-FLW-005 | Is Connected | `isConnected` | done | 2026-06-08 |

## Isomorphism (`@graphrs/isomorphism`)

| BWU ID | Algorithm | Function | Status | Date |
|--------|-----------|----------|--------|------|
| BWU-ISO-001 | Is Isomorphic (VF2) | `isIsomorphic` | done | 2026-06-08 |
| BWU-ISO-002 | Subgraph Isomorphic | `subgraphIsomorphic` | done | 2026-06-08 |
| BWU-ISO-003 | Canonical Permutation | `canonicalPermutation` | done | 2026-06-08 |
| BWU-ISO-004 | Automorphism Group Size | `automorphismGroupSize` | done | 2026-06-08 |
