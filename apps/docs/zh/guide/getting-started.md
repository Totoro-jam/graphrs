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

## 环境要求

- **Node.js** >= 20.0.0
- **浏览器**：任何支持 WebAssembly 的现代浏览器
- **TypeScript** >= 5.0（推荐，非必需）

## 下一步

- [图基础](/zh/guide/graph-basics) — 学习如何创建和操作图
- [算法概览](/zh/guide/algorithms) — 所有可用算法包的总览
- [集成示例](/zh/examples/antv-g6) — 将 graphrs 与流行的可视化库配合使用
