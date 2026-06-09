# 算法概览

graphrs 将 400+ 图算法组织到模块化的包中。每个包都可以独立安装，并支持 tree-shaking。

## 包一览

| 包                                            | 说明           | 函数                                                                                                                                                |
| --------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@graphrs/community`](/zh/api/community)     | 社区检测       | louvain, leiden, infomap, labelPropagation, walktrap, fastGreedy, spinglass, fluidCommunities                                                       |
| [`@graphrs/centrality`](/zh/api/centrality)   | 中心性度量     | pagerank, betweenness, closeness, eigenvector, hits, katz, harmonic                                                                                 |
| [`@graphrs/path`](/zh/api/path)               | 最短路径与遍历 | dijkstra, bellmanFord, bfs, dfs, allPairsShortestPaths                                                                                              |
| [`@graphrs/layout`](/zh/api/layout)           | 图布局         | layoutFR, layoutKK, layoutGraphopt, layoutSugiyama, layoutReingoldTilford, layoutCircle, layoutGrid, layoutStar, layoutRandom, layoutMDS, layoutDRL |
| [`@graphrs/generators`](/zh/api/generators)   | 图生成器       | erdosRenyi, barabasiAlbert, wattsStrogatz, stochasticBlockModel, complete, ring, lattice, star, tree, path                                          |
| [`@graphrs/io`](/zh/api/io)                   | 导入导出       | readGraphML, writeGraphML, readGML, writeGML, readDOT, writeDOT, readEdgeList, writeEdgeList, readPajek, writePajek                                 |
| [`@graphrs/operators`](/zh/api/operators)     | 图变换         | union, intersection, difference, simplify, reverse, toDirected, toUndirected, inducedSubgraph, complement                                           |
| [`@graphrs/flow`](/zh/api/flow)               | 网络流         | maxFlow, minCut, vertexConnectivity, edgeConnectivity, isConnected                                                                                  |
| [`@graphrs/isomorphism`](/zh/api/isomorphism) | 结构匹配       | isIsomorphic, subgraphIsomorphic, canonicalPermutation, automorphismGroupSize                                                                       |

## 通用模式

每个算法函数都遵循相同的模式：

```typescript
import { Graph } from '@graphrs/core';
import { someAlgorithm } from '@graphrs/some-package';

const graph = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 0],
]);

// 所有算法函数都是异步的
const result = await someAlgorithm(graph, {
  // 可选的类型化选项
});
```

### 规则

1. **第一个参数**始终是 `Graph` 实例
2. **第二个参数**是可选的类型化选项对象
3. **返回值**始终是类型化结果的 `Promise`
4. **WASM 加载**在首次调用时自动完成

## 结果类型

每个算法族返回特定的结果类型：

```typescript
// 社区检测 → CommunityResult
{ membership: number[], modularity: number, clusters: number }

// 中心性度量 → CentralityResult
{ scores: number[] }

// 最短路径 → PathResult
{ path: number[], distance: number }

// 布局 → LayoutResult
{ positions: [number, number][] }

// 网络流 → FlowResult
{ value: number, flow: number[] }
```

## 异步行为

所有算法函数都是 `async` 的，因为 WASM 模块采用惰性加载：

```typescript
// 首次调用：加载 WASM（约 1-2ms），然后运行算法
const result1 = await pagerank(graph);

// 后续调用：WASM 已加载，立即运行
const result2 = await betweenness(graph);
```

WASM 模块是单例模式 —— 只加载一次，在所有包之间共享使用。

## 子路径导入

为了更细粒度的导入，每个包都支持子路径导出：

```typescript
// 从子路径导入
import { dijkstra } from '@graphrs/path/dijkstra';
import { louvain } from '@graphrs/community';

// 等价的桶导入
import { dijkstra } from '@graphrs/path';
```
