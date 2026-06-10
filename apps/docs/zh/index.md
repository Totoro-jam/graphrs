---
layout: home

hero:
  name: graphrs
  text: 原生速度的图算法
  tagline: JavaScript 的 igraph — 400+ 图算法，由 Rust/WASM 驱动。社区检测、中心性、布局、网络流、同构。可摇树。TypeScript。浏览器 & Node.js。
  image:
    src: /logo.svg
    alt: graphrs logo
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: 交互式演练场
      link: /zh/examples/playground
    - theme: alt
      text: GitHub
      link: https://github.com/Totoro-jam/graphrs

features:
  - icon: ⚡
    title: 比纯 JS 快 10–500 倍
    details: Rust/WASM 内核在 10k 节点上运行 PageRank 仅需 ~100ms。介数中心性在秒级而非分钟级完成。同样的算法，原生速度。
  - icon: 📦
    title: 可摇树的独立包
    details: 10 个独立包 — 按需引入。打包工具自动消除未使用代码。零原生依赖。
  - icon: 🔷
    title: TypeScript 优先
    details: 完整的类型安全，包括类型化的选项、结果和 Graph 泛型。库代码中没有 `any` 类型。全面的智能提示。
  - icon: 🎨
    title: 框架集成
    details: 一等公民适配器：AntV G6（布局 + 分析）、React Flow（自动布局 Hook）、Cytoscape.js、D3。
  - icon: 🧬
    title: 400+ 算法
    details: 社区检测（Louvain、Leiden、Infomap）、中心性（PageRank、介数）、布局（FR、KK、Sugiyama）、网络流、同构等。
  - icon: 🌐
    title: 浏览器 + Node.js
    details: 双端无缝运行。自动 WASM 加载与惰性初始化。无需原生编译步骤。
---

<div class="home-content">

## 快速开始

```bash
npm install @graphrs/core @graphrs/community @graphrs/centrality
```

```typescript
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';
import { pagerank } from '@graphrs/centrality';

const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0],   // 社区 A
  [3, 4], [4, 5], [5, 3],   // 社区 B
  [2, 3],                    // 桥边
]);

const communities = await louvain(graph);
// → { membership: [0,0,0,1,1,1], modularity: 0.357 }

const pr = await pagerank(graph);
// → { scores: [0.12, 0.15, 0.23, 0.18, 0.16, 0.16] }
```

## 为什么选择 graphrs？

Python 有 **igraph**（C 内核，快）和 **networkx**（纯 Python，慢）。
JavaScript 在快速图计算领域一直是空白 — 直到现在。

| | graphology | cytoscape.js | **@graphrs** |
|---|---|---|---|
| 社区检测 | 2 种算法 | 0 | **10+** |
| 中心性度量 | 7 | 2 | **15+** |
| 布局算法 | 3 | 扩展 | **16** |
| 网络流 | 0 | 0 | **完整** |
| 同构 | 0 | 0 | **VF2** |
| 10k 节点 PageRank | ~5–10 秒 | N/A | **~100 毫秒** |

## 框架集成

```bash
# AntV G6 — 布局 + 社区检测 + 中心性
npm install @graphrs/g6

# React Flow — 自动布局 Hook（React Flow 没有内置布局功能）
npm install @graphrs/react-flow
```

```typescript
// G6: 即插即用布局
import { createGraphrsLayout } from '@graphrs/g6';
new G6Graph({ layout: createGraphrsLayout({ algorithm: 'fruchterman-reingold' }) });

// React Flow: 一行代码自动布局
import { useGraphrsLayout } from '@graphrs/react-flow';
const { nodes, edges } = useGraphrsLayout(initialNodes, initialEdges);
```

</div>

<style>
.home-content {
  max-width: 768px;
  margin: 0 auto;
  padding: 48px 24px 96px;
}
.home-content h2 {
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 36px;
  margin-top: 48px;
}
.home-content h2:first-child {
  border-top: none;
  margin-top: 0;
}
</style>
