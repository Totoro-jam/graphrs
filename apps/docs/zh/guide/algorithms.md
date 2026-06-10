# 算法概览

graphrs 将 400+ 图算法组织到模块化的包中。每个包都可以独立安装，并支持 tree-shaking。

## 包一览

### 算法包

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

### 集成包

| 包                                              | 说明              | 功能                                                        |
| ----------------------------------------------- | ----------------- | ----------------------------------------------------------- |
| [`@graphrs/g6`](/zh/api/g6)                     | AntV G6 适配器    | 提供 G6 兼容的布局函数、社区着色和中心性大小映射             |
| [`@graphrs/react-flow`](/zh/api/react-flow)     | React Flow 适配器 | `useGraphrsLayout` hook，自动定位 React Flow 节点           |

## 如何选择算法

### 社区检测

| 算法                 | 速度 | 质量 | 最适合                                     |
| -------------------- | ---- | ---- | ------------------------------------------ |
| `louvain`            | 快   | 好   | 通用场景，第一选择                         |
| `leiden`             | 快   | 最佳 | 需要保证社区内部连通时使用                 |
| `labelPropagation`   | 最快 | 可变 | 超大图（>100k 节点）                       |
| `infomap`            | 中等 | 最佳 | 信息流/路由网络                            |
| `walktrap`           | 中等 | 好   | 结构清晰的中小规模图                       |
| `fastGreedy`         | 快   | 好   | 层次化社区结构                             |
| `spinglass`          | 慢   | 好   | 需要精确控制（自旋数量）                   |
| `fluidCommunities`   | 快   | 可变 | 预先知道社区数量 `k` 时使用                |

### 中心性度量

| 算法           | 度量内容         | 最适合                                     |
| -------------- | ---------------- | ------------------------------------------ |
| `pagerank`     | 全局重要性       | 按影响力排名（网页、社交网络）             |
| `betweenness`  | 桥接/中介角色    | 发现瓶颈和中间人                           |
| `closeness`    | 到所有节点的距离 | 发现访问最快的节点                         |
| `eigenvector`  | 邻居重要性       | 连接到重要节点的节点                       |
| `hits`         | 枢纽/权威分数    | 有向网络（网页链接分析）                   |
| `katz`         | 衰减游走计数     | 具有远程影响的网络                         |
| `harmonic`     | 调和平均距离     | 非连通图（优雅降级）                       |

### 布局算法

| 算法                    | 类型     | 最适合                     |
| ----------------------- | -------- | -------------------------- |
| `layoutFR`              | 力导向   | 通用可视化                 |
| `layoutKK`              | 力导向   | 强调最短路径距离           |
| `layoutSugiyama`        | 分层     | DAG、层次结构、工作流      |
| `layoutReingoldTilford` | 树形     | 树结构                     |
| `layoutCircle`          | 几何     | 环形/循环拓扑              |
| `layoutGrid`            | 几何     | 均匀排列                   |
| `layoutDRL`             | 力导向   | 超大图（>10k 节点）        |

## 通用模式

每个算法函数都遵循相同的模式：

```typescript
import { Graph } from '@graphrs/core';
import { someAlgorithm } from '@graphrs/some-package';

const graph = Graph.fromEdges([[0, 1], [1, 2], [2, 0]]);

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

## 组合算法

常见模式是链式组合多个算法进行完整的分析管线：

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

// 并行运行 — 它们相互独立
const [communities, pr, layout] = await Promise.all([
  louvain(graph),
  pagerank(graph),
  layoutFR(graph),
]);

// 组合用于可视化
const nodes = graph.nodes().map((id, i) => ({
  id,
  x: layout.positions[i]![0],
  y: layout.positions[i]![1],
  community: communities.membership[i],
  importance: pr.scores[i],
}));
```

## 子路径导入

为了更细粒度的导入，每个包都支持子路径导出：

```typescript
// 从子路径导入
import { dijkstra } from '@graphrs/path/dijkstra';
import { louvain } from '@graphrs/community';

// 等价的桶导入
import { dijkstra } from '@graphrs/path';
```
