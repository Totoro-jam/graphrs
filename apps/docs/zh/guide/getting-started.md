<script setup>
const quickExample = `import { Graph } from '@graphrs/core';

// 创建一个包含两个集群的图
const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0],  // 集群 1
  [3, 4], [4, 5], [5, 3],  // 集群 2
  [2, 3],                   // 桥接边
]);

console.log('节点数:', graph.nodeCount());
console.log('边数:', graph.edgeCount());
console.log('节点 2 的邻居:', graph.neighbors(2));
console.log('节点 2 的度:', graph.degree(2));

// 添加自定义数据
graph.addNode(0, { role: 'bridge-left' });
graph.addNode(3, { role: 'bridge-right' });
console.log('\\n节点 0 数据:', JSON.stringify(graph.nodeData(0)));
console.log('节点 3 数据:', JSON.stringify(graph.nodeData(3)));
`;
</script>

# 快速开始

## 安装

安装核心包和你需要的算法包：

```bash
# 核心包（必需）
npm install @graphrs/core

# 算法包（按需选择）
npm install @graphrs/community
npm install @graphrs/centrality
npm install @graphrs/path
npm install @graphrs/layout
npm install @graphrs/generators
npm install @graphrs/io
npm install @graphrs/operators
npm install @graphrs/flow
npm install @graphrs/isomorphism
```

::: tip
每个包都可以独立安装，并支持 tree-shaking。只导入你需要的部分 —— 打包工具会自动排除其余内容。
:::

## 快速示例

```typescript
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';
import { pagerank } from '@graphrs/centrality';

// 创建图
const graph = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 0], // 集群 1
  [3, 4],
  [4, 5],
  [5, 3], // 集群 2
  [2, 3], // 桥接边
]);

// 检测社区
const communities = await louvain(graph);
console.log(communities.membership); // [0, 0, 0, 1, 1, 1]
console.log(communities.modularity); // ~0.357

// 计算 PageRank
const pr = await pagerank(graph);
console.log(pr.scores); // 每个节点的重要性分数
```

### 在线体验

<Playground :code="quickExample" />

## 工作原理

graphrs 是 [rust-igraph](https://github.com/Totoro-jam/rust-igraph) 的 TypeScript 封装，rust-igraph 是 [igraph](https://igraph.org/) 图算法库的 Rust 绑定，编译为 WebAssembly。当你调用一个算法函数时：

1. WASM 模块在首次使用时惰性加载
2. 你的图数据被序列化到 WASM 内存中
3. 算法在 WASM 沙箱中以原生速度运行
4. 结果被解析回类型化的 TypeScript 对象

所有算法函数都是 `async` 的，因为 WASM 模块在首次调用时异步加载。后续调用会立即执行。

## 异步模式

每个算法函数都返回 `Promise`。以下是常见的使用方式：

### 顺序调用

```typescript
const communities = await louvain(graph);
const pr = await pagerank(graph);
```

### 并行调用

使用 `Promise.all` 并发运行独立的算法：

```typescript
const [communities, pr, layout] = await Promise.all([
  louvain(graph),
  pagerank(graph),
  layoutFR(graph),
]);
```

### 顶层 await

在 ESM 模块或现代打包工具中，使用顶层 `await`：

```typescript
// app.ts (ESM)
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';

const graph = Graph.fromEdges([[0,1],[1,2],[2,0]]);
const result = await louvain(graph);
```

### 在非 async 上下文中

使用 async IIFE 或 `.then()` 包装：

```typescript
(async () => {
  const result = await louvain(graph);
  console.log(result.clusters);
})();
```

## 错误处理

graphrs 抛出类型化的错误，你可以捕获并处理：

```typescript
import { Graph, NodeNotFoundError, EdgeNotFoundError } from '@graphrs/core';

const g = new Graph();
g.addNode(0);

try {
  g.neighbors(99); // 节点 99 不存在
} catch (e) {
  if (e instanceof NodeNotFoundError) {
    console.log(`节点不存在: ${e.message}`);
  }
}

try {
  g.removeEdge(0, 1); // 边不存在
} catch (e) {
  if (e instanceof EdgeNotFoundError) {
    console.log('边不存在');
  }
}
```

WASM 算法错误会 reject Promise：

```typescript
import { maxFlow } from '@graphrs/flow';

try {
  await maxFlow(graph, 0, 0); // source === target
} catch (e) {
  console.log('算法错误:', e.message);
}
```

## 常见模式

### 构建 → 分析 → 可视化

典型的工作流程：创建图、运行算法、导出用于渲染。

```typescript
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';
import { layoutFR } from '@graphrs/layout';

// 1. 构建图
const graph = Graph.fromEdges([
  [0,1],[1,2],[2,0],[3,4],[4,5],[5,3],[2,3],
]);

// 2. 分析
const [communities, layout] = await Promise.all([
  louvain(graph),
  layoutFR(graph),
]);

// 3. 导出用于可视化
const g6Data = graph.toG6Format(layout);
// 将 g6Data 传递给你的渲染库
```

### 从外部数据构建图

```typescript
// 从 API 响应
const response = await fetch('/api/network');
const { nodes, edges } = await response.json();

const graph = new Graph();
for (const node of nodes) {
  graph.addNode(node.id, node);
}
for (const edge of edges) {
  graph.addEdge(edge.from, edge.to, { weight: edge.weight });
}
```

### 链式调用

所有修改方法都返回 `this`，支持链式调用：

```typescript
const graph = new Graph()
  .addNode(0, { label: 'A' })
  .addNode(1, { label: 'B' })
  .addNode(2, { label: 'C' })
  .addEdge(0, 1)
  .addEdge(1, 2)
  .addEdge(2, 0);
```

## 环境要求

- **Node.js** >= 20.0.0
- **浏览器**：任何支持 WebAssembly 的现代浏览器
- **TypeScript** >= 5.0（推荐，非必需）

## 下一步

- [图基础](/zh/guide/graph-basics) — 学习如何创建和操作图
- [算法概览](/zh/guide/algorithms) — 所有可用算法包的总览
- [交互式演练场](/zh/examples/playground) — 实时演示：力导向布局、社区检测、PageRank、性能基准
- [集成示例](/zh/examples/antv-g6) — 将 graphrs 与 AntV G6、React Flow、Cytoscape.js、D3 配合使用
