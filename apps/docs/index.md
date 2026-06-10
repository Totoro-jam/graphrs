---
layout: home

hero:
  name: graphrs
  text: Graph Algorithms at Native Speed
  tagline: The igraph for JavaScript — 400+ graph algorithms powered by Rust/WASM. Community detection, centrality, layout, flow, isomorphism. Tree-shakable. TypeScript. Browser & Node.js.
  image:
    light: /logo.svg
    dark: /logo.svg
    alt: graphrs logo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Interactive Playground
      link: /examples/playground
    - theme: alt
      text: GitHub
      link: https://github.com/Totoro-jam/graphrs

features:
  - icon: ⚡
    title: 10–500× Faster than Pure JS
    details: Rust/WASM core delivers PageRank on 10k nodes in ~100ms. Betweenness centrality in seconds instead of minutes. Same algorithms, native speed.
  - icon: 📦
    title: Tree-Shakable Packages
    details: 10 independent packages — import only what you need. Your bundler eliminates the rest. Zero native dependencies.
  - icon: 🔷
    title: TypeScript First
    details: Full type safety with typed options, results, and Graph generics. No `any` types in library code. IntelliSense everywhere.
  - icon: 🎨
    title: Framework Integrations
    details: First-class adapters for AntV G6 (layout + analysis), React Flow (auto-layout hook), Cytoscape.js, and D3.
  - icon: 🧬
    title: 400+ Algorithms
    details: Community detection (Louvain, Leiden, Infomap), centrality (PageRank, betweenness), layout (FR, KK, Sugiyama), flow, isomorphism, and more.
  - icon: 🌐
    title: Browser + Node.js
    details: Works seamlessly in both environments. Automatic WASM loading with lazy initialization. No native compilation step.
---

<div class="home-content">

## Quick Start

```bash
npm install @graphrs/core @graphrs/community @graphrs/centrality
```

```typescript
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';
import { pagerank } from '@graphrs/centrality';

const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0],   // cluster A
  [3, 4], [4, 5], [5, 3],   // cluster B
  [2, 3],                    // bridge
]);

const communities = await louvain(graph);
// → { membership: [0,0,0,1,1,1], modularity: 0.357 }

const pr = await pagerank(graph);
// → { scores: [0.12, 0.15, 0.23, 0.18, 0.16, 0.16] }
```

## Why graphrs?

Python has **igraph** (C core, fast) and **networkx** (pure Python, slow).
JavaScript had **nothing** in the fast category — until now.

| | graphology | cytoscape.js | **@graphrs** |
|---|---|---|---|
| Community detection | 2 algorithms | 0 | **10+** |
| Centrality measures | 7 | 2 | **15+** |
| Layout algorithms | 3 | ext | **16** |
| Network flow | 0 | 0 | **Full** |
| Isomorphism | 0 | 0 | **VF2** |
| 10k nodes PageRank | ~5–10 s | N/A | **~100 ms** |

## Framework Integration

```bash
# AntV G6 — layout + community detection + centrality
npm install @graphrs/g6

# React Flow — auto-layout hook (React Flow has ZERO built-in layout)
npm install @graphrs/react-flow
```

```typescript
// G6: plug-and-play layout
import { createGraphrsLayout } from '@graphrs/g6';
new G6Graph({ layout: createGraphrsLayout({ algorithm: 'fruchterman-reingold' }) });

// React Flow: one-line auto-layout
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
