# @graphrs — High-Level TypeScript Graph Library (MIT)

## Executive Summary

Build a modular, tree-shakable TypeScript graph library powered by Rust/WASM.
Target: Browser + Node.js dual-environment, MIT licensed, npm scoped as `@graphrs/*`.

---

## 0. Repo Positioning & Description

### Vision (English — for repo creation)

**Repo name**: `graphrs`

**GitHub Description** (max 350 chars):
```
The graph algorithm library JavaScript never had. 400+ algorithms (community detection, 
centrality, layout, flow, isomorphism) at native speed via WebAssembly. Works in Browser 
and Node.js. Zero native dependencies. MIT licensed.
```

**README Tagline**:
```
igraph for JavaScript — comprehensive graph algorithms at native speed.
```

**Topics/Tags**: `graph-algorithms` `wasm` `webassembly` `typescript` `community-detection`
`pagerank` `shortest-path` `network-analysis` `graph-layout` `social-network-analysis`

### The Gap We Fill

Python has networkx (pure Python, slow) and igraph (C core, fast).
JavaScript has graphology (pure JS, limited) and... nothing fast.

**@graphrs fills the "igraph for JavaScript" gap** — a comprehensive, high-performance
graph analysis library powered by Rust/WASM. It is NOT just a layout helper for
visualization frameworks. It's a general-purpose analysis engine that also happens
to be great for visualization.

### Competitive Landscape

| Capability | graphology (JS) | cytoscape.js | ngraph | **@graphrs (WASM)** |
|-----------|----------------|--------------|--------|---------------------|
| Community detection | 2 (louvain, leiden) | 0 | 0 | **10+** (+ infomap, spinglass, walktrap, fluid...) |
| Centrality measures | 7 | 2 | 0 | **15+** (+ katz, harmonic, constraint, convergence...) |
| Layout engines | 3 | delegates to ext | 1 (force) | **16** (FR, KK, DRL, Sugiyama, MDS...) |
| Network flow | 0 | 0 | 0 | **Full** (max-flow, min-cut, Gomory-Hu, connectivity) |
| Isomorphism | 0 | 0 | 0 | **VF2 + canonical (BLISS-style)** |
| Structural predicates | few | few | 0 | **50+** (is_planar, is_chordal, is_perfect...) |
| Graph generators | ~10 | ~5 | ~3 | **30+** |
| Performance (10k nodes PageRank) | ~5-10s | N/A | N/A | **~100ms** |
| Performance (50k force layout) | frozen | frozen | slow | **~2.5s in Worker** |

### Use Cases (Beyond Visualization)

1. **Social network analysis** — community detection, influence propagation (Node.js microservice)
2. **Knowledge graphs** — path queries, centrality ranking (browser-based knowledge explorer)
3. **Network security** — anomaly detection via subgraph matching, real-time connectivity analysis
4. **Supply chain** — flow optimization, bottleneck identification
5. **Recommendation engines** — similarity metrics, link prediction
6. **Fraud detection** — subgraph isomorphism, motif census
7. **Bioinformatics** — protein interaction networks, pathway analysis
8. **Visualization acceleration** — drop-in layout engine for React Flow / G6 / Cytoscape / D3

### Why @graphrs vs. Alternatives

| Alternative | Why @graphrs is better |
|-------------|----------------------|
| python-igraph via Pyodide | Pyodide is ~20MB; @graphrs .wasm is ~300KB. 60x smaller. |
| python-igraph via subprocess (Node) | @graphrs is in-process, zero IPC overhead, no Python install. |
| graphology (pure JS) | 50x faster on large graphs; 5x more algorithms. |
| @antv/layout-wasm | Only 4 layout algorithms. @graphrs: 400+ algorithms across all domains. |
| Rolling your own (d3-force + dagre + ...) | Fragmented dependencies, inconsistent API, no WASM acceleration. |

---

## 0.15 Package Split Rationale

The package split mirrors the universal graph algorithm taxonomy (not any specific
framework's needs). This ensures the library is useful standalone, not just as an
addon for visualization tools.

```
@graphrs/core          — Graph data structure + basic queries (degree, neighbors, components)
@graphrs/community     — Community detection (10 algorithms)
@graphrs/centrality    — Node/edge importance metrics (15+ measures)
@graphrs/path          — Shortest paths, traversal, distances
@graphrs/layout        — Spatial embedding algorithms (for visualization)
@graphrs/generators    — Synthetic graph construction (for testing/simulation)
@graphrs/io            — Import/export (GraphML, GML, DOT, edgelist, Pajek)
@graphrs/operators     — Graph transformations (union, complement, simplify...)
@graphrs/flow          — Network flow & connectivity
@graphrs/isomorphism   — Structural matching & symmetry

# Framework adapters (optional, thin):
@graphrs/react-flow    — useGraphrsLayout hook for React Flow
@graphrs/g6            — G6 custom layout + analysis plugin
```

**Why this split works for general use:**
- A Node.js backend doing social network analysis only needs: `core` + `community` + `centrality`
- A React Flow app only needs: `core` + `layout` + `react-flow`
- A knowledge graph explorer needs: `core` + `path` + `centrality`
- Nobody pays for algorithms they don't use (tree-shaking + separate packages)

**What stays in `core` (not its own package):**
- Structural predicates (is_tree, is_planar...) — lightweight queries, not heavy algorithms
- Basic connectivity (components, bridges, articulation points) — fundamental graph properties
- Degree analysis — too small to be its own package

---

## 0.1 Design Corrections (vs. Initial Draft)

After researching G6's architecture, three design issues need addressing:

### Issue 1: Data Transfer Overhead

**Problem**: JSON.stringify/parse for a 50k-edge graph costs 20-50ms — unacceptable for
iterative layouts that run 300+ ticks.

**Fix**: Keep graph data IN WASM memory. The `Graph` class holds a persistent `WasmGraph`
handle. Mutations sync incrementally, not full-serialize.

```typescript
class Graph {
  private _wasmHandle: number | null = null;  // pointer into WASM linear memory
  
  // Lazy: only serialize to WASM on first algorithm call
  private async _ensureWasm(): Promise<number> {
    if (this._wasmHandle === null) {
      const wasm = await getWasm();
      this._wasmHandle = wasm.graphFromEdges(this._edges);  // one-time transfer
    }
    return this._wasmHandle;
  }
  
  // Incremental sync for mutations
  addEdge(source: number, target: number) {
    this._edges.push([source, target]);
    if (this._wasmHandle !== null) {
      wasm.graphAddEdge(this._wasmHandle, source, target);  // incremental
    }
  }
}
```

### Issue 2: Progressive/Streaming Layout

**Problem**: Force-directed layouts need per-tick output for smooth animation.
One-shot "compute 500 iterations then return" blocks the UI.

**Fix**: Two modes:
1. **Batch mode** (default): compute all iterations in WASM, return final positions
2. **Tick mode**: WASM computes N ticks, yields positions, JS renders, repeat

```typescript
// Batch (simple, fast)
const positions = await layoutFR(graph, { iterations: 500 });

// Tick (progressive, for animation)
const sim = createForceSimulation(graph, { 
  algorithm: 'fruchterman-reingold',
  ticksPerFrame: 10  // 10 WASM ticks per requestAnimationFrame
});
sim.on('tick', (positions) => updateVisualization(positions));
sim.on('end', () => console.log('converged'));
sim.start();
```

### Issue 3: Framework Adapter Packages

**Fix**: Add two integration packages:

```
packages/
├── react-flow/              # @graphrs/react-flow
│   ├── src/
│   │   ├── useGraphrsLayout.ts    # Drop-in hook
│   │   ├── GraphrsLayoutProvider.tsx
│   │   └── adapters.ts            # Convert React Flow nodes ↔ Graph
│   └── package.json
├── g6/                      # @graphrs/g6
│   ├── src/
│   │   ├── register.ts            # Register as G6 custom layout
│   │   ├── GraphrsLayout.ts       # G6 Layout class implementation
│   │   └── analysis.ts            # Community/centrality as G6 plugins
│   └── package.json
```

---

## 0.2 Minimal Demo Plan (Proof of Value)

Three demos, each targeting a different use case to prove @graphrs isn't just a layout tool.

---

### Demo 1: Layout Performance (Visualization — React Flow)

**Goal**: Prove 10-100x layout speedup vs d3-force/dagre for React Flow.

```tsx
// The entire integration is one hook:
import { useGraphrsLayout } from "@graphrs/react-flow";

const { positions, timing } = useGraphrsLayout(nodes, edges, {
  algorithm: "fruchterman-reingold",
  iterations: 300,
  worker: true,  // non-blocking
});
```

**Expected results**:

| Nodes | d3-force (JS) | @graphrs (WASM Worker) | Speedup |
|-------|---------------|------------------------|---------|
| 1,000 | ~800ms | ~30ms | 27x |
| 10,000 | ~15s | ~350ms | 43x |
| 50,000 | frozen | ~2.5s | ∞ |

**Deliverable**: Vercel-deployed React app with slider (100→50k nodes), live timing comparison.

---

### Demo 2: Social Network Analysis (General Analysis — Node.js)

**Goal**: Show @graphrs as a Python-igraph replacement for backend analysis.

```typescript
// Node.js script: analyze a 100k-node social network
import { Graph } from "@graphrs/core";
import { louvain } from "@graphrs/community";
import { pagerank } from "@graphrs/centrality";
import { readGraphML } from "@graphrs/io";

const graph = await readGraphML("twitter_follows.graphml");
console.log(`${graph.nodeCount()} users, ${graph.edgeCount()} connections`);

// Community detection — find interest groups
const communities = await louvain(graph);
console.log(`Found ${communities.clusters} communities (modularity: ${communities.modularity})`);

// Centrality — find influencers per community
const pr = await pagerank(graph, { damping: 0.85 });
const topInfluencers = pr.scores
  .map((score, id) => ({ id, score, community: communities.membership[id] }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 20);

console.table(topInfluencers);
// All of this runs in ~2 seconds for 100k nodes. 
// Same analysis in networkx: ~45 seconds. python-igraph: ~3 seconds.
```

**Deliverable**: CLI script with benchmark output. README comparison table vs networkx/igraph-python.

---

### Demo 3: Real-Time Path Analysis (Browser — Knowledge Graph Explorer)

**Goal**: Show interactive graph querying at WASM speed in a browser app.

```typescript
// Browser: knowledge graph explorer with instant path queries
import { Graph } from "@graphrs/core";
import { dijkstra, allSimplePaths } from "@graphrs/path";
import { betweenness } from "@graphrs/centrality";

// Load a knowledge graph (e.g., Wikidata subset, 50k entities)
const kg = await Graph.fromJSON(knowledgeGraphData);

// User clicks two entities → instant shortest path
async function onPathQuery(source: string, target: string) {
  const result = await dijkstra(kg, kg.nodeId(source), kg.nodeId(target));
  highlightPath(result.path);  // < 10ms for 50k nodes
}

// Real-time: as user explores, show importance scores
async function onRegionSelect(nodeIds: number[]) {
  const subgraph = kg.subgraph(nodeIds);
  const scores = await betweenness(subgraph);
  colorByImportance(scores);  // instant for subgraphs < 5k nodes
}
```

**Deliverable**: Browser app with entity search + path highlighting + importance heatmap.

---

### Demo Execution Priority

| Priority | Demo | Effort | Impact |
|----------|------|--------|--------|
| **P0** | Layout benchmark (React Flow) | ~13h | Proves perf claim, attracts visualization devs |
| **P1** | Node.js analysis script | ~4h | Proves general-purpose, attracts backend devs |
| **P2** | Knowledge graph explorer | ~20h | Impressive showcase, but complex |

**Start with P0** — it's the fastest to build and produces the most shareable content
(GIF of slider going from 1k to 50k nodes with real-time timing).

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    User Application                            │
│  import { Graph } from "@graphrs/core"                        │
│  import { louvain } from "@graphrs/community"                 │
│  import { pagerank } from "@graphrs/centrality"               │
└────────────────────────┬─────────────────────────────────────┘
                         │ (ESM imports, tree-shakable)
┌────────────────────────▼─────────────────────────────────────┐
│              TypeScript Wrapper Layer (MIT)                    │
│  • Type-safe Graph class with full generics                   │
│  • Ergonomic async API (WASM init is async)                   │
│  • JSON ↔ typed object marshalling                            │
│  • Each package is independently publishable                  │
└────────────────────────┬─────────────────────────────────────┘
                         │ (calls .wasm exports via wasm-bindgen glue)
┌────────────────────────▼─────────────────────────────────────┐
│              WASM Binary Layer (GPL-2.0, bundled)              │
│  • Compiled from rust-igraph (crates/igraph-wasm)             │
│  • Single .wasm file, lazy-loaded                             │
│  • All 400+ algorithm exports available                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Package Structure (Monorepo)

```
graphrs/                          # New repo: github.com/Totoro-jam/graphrs
├── packages/
│   ├── core/                     # @graphrs/core
│   │   ├── src/
│   │   │   ├── index.ts          # Re-exports
│   │   │   ├── graph.ts          # Graph class (typed nodes/edges)
│   │   │   ├── wasm-loader.ts    # Singleton WASM init + cache
│   │   │   ├── types.ts          # Shared types (VertexId, EdgeId, etc.)
│   │   │   └── errors.ts         # GraphError class
│   │   ├── wasm/
│   │   │   ├── graphrs_bg.wasm   # Compiled binary (from rust-igraph CI)
│   │   │   └── graphrs.js        # wasm-bindgen JS glue
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── community/                # @graphrs/community
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── louvain.ts
│   │   │   ├── leiden.ts
│   │   │   ├── infomap.ts
│   │   │   ├── spinglass.ts
│   │   │   ├── label-propagation.ts
│   │   │   ├── walktrap.ts
│   │   │   ├── fast-greedy.ts
│   │   │   └── fluid.ts
│   │   └── package.json
│   ├── centrality/               # @graphrs/centrality
│   │   ├── src/
│   │   │   ├── pagerank.ts
│   │   │   ├── betweenness.ts
│   │   │   ├── closeness.ts
│   │   │   ├── eigenvector.ts
│   │   │   ├── hits.ts
│   │   │   ├── katz.ts
│   │   │   └── harmonic.ts
│   │   └── package.json
│   ├── layout/                   # @graphrs/layout
│   │   ├── src/
│   │   │   ├── force-directed.ts # FR, KK, graphopt
│   │   │   ├── hierarchical.ts   # Sugiyama, Reingold-Tilford
│   │   │   ├── geometric.ts      # circle, grid, star, random
│   │   │   └── dimensional.ts    # MDS, DRL, DRL-3D
│   │   └── package.json
│   ├── path/                     # @graphrs/path
│   │   ├── src/
│   │   │   ├── dijkstra.ts
│   │   │   ├── bellman-ford.ts
│   │   │   ├── bfs.ts
│   │   │   ├── dfs.ts
│   │   │   └── all-pairs.ts
│   │   └── package.json
│   ├── generators/               # @graphrs/generators
│   │   ├── src/
│   │   │   ├── random.ts         # ER, Barabasi, WS, SBM
│   │   │   ├── deterministic.ts  # famous, lattice, tree, complete
│   │   │   └── index.ts
│   │   └── package.json
│   ├── io/                       # @graphrs/io
│   │   ├── src/
│   │   │   ├── graphml.ts
│   │   │   ├── gml.ts
│   │   │   ├── dot.ts
│   │   │   ├── edgelist.ts
│   │   │   └── pajek.ts
│   │   └── package.json
│   ├── operators/                # @graphrs/operators
│   │   ├── src/
│   │   │   ├── set-operations.ts # union, intersection, difference
│   │   │   ├── transforms.ts    # simplify, reverse, to_directed
│   │   │   └── subgraph.ts
│   │   └── package.json
│   ├── flow/                     # @graphrs/flow
│   │   └── src/
│   │       ├── max-flow.ts
│   │       ├── min-cut.ts
│   │       └── connectivity.ts
│   └── isomorphism/              # @graphrs/isomorphism
│       └── src/
│           ├── vf2.ts
│           ├── canonical.ts
│           └── automorphism.ts
├── tools/
│   ├── build-wasm.sh            # Fetch/build .wasm from rust-igraph
│   └── sync-types.ts            # Auto-generate TS types from .wasm exports
├── examples/
│   ├── browser-vanilla/
│   ├── react-antv-g6/
│   ├── node-analysis/
│   └── web-worker/
├── pnpm-workspace.yaml
├── turbo.json                   # Turborepo for build orchestration
├── LICENSE                      # MIT
├── LICENSE-WASM                 # GPL-2.0 (for bundled .wasm binary)
└── README.md
```

---

## 3. Key Design Decisions

### 3.1 Tree-Shaking Strategy

```jsonc
// packages/community/package.json
{
  "name": "@graphrs/community",
  "version": "0.1.0",
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
    "./louvain": { "import": "./dist/louvain.js", "types": "./dist/louvain.d.ts" },
    "./leiden": { "import": "./dist/leiden.js", "types": "./dist/leiden.d.ts" }
  },
  "peerDependencies": {
    "@graphrs/core": "^0.1.0"
  }
}
```

Tree-shaking works at TWO levels:
1. **Package level**: User only installs `@graphrs/community`, not the whole suite
2. **Subpath level**: `import { louvain } from "@graphrs/community/louvain"` — bundler eliminates all other community algorithms

### 3.2 WASM Loading Strategy

```typescript
// packages/core/src/wasm-loader.ts
let wasmInstance: WasmExports | null = null;
let initPromise: Promise<WasmExports> | null = null;

export async function getWasm(): Promise<WasmExports> {
  if (wasmInstance) return wasmInstance;
  if (!initPromise) {
    initPromise = initWasm();
  }
  return initPromise;
}

async function initWasm(): Promise<WasmExports> {
  // Browser: fetch() the .wasm URL
  // Node.js: fs.readFile() the .wasm from node_modules
  const env = detectEnvironment();
  
  if (env === 'browser') {
    const wasmUrl = new URL('./graphrs_bg.wasm', import.meta.url);
    const { default: init } = await import('./graphrs.js');
    wasmInstance = await init(wasmUrl);
  } else {
    const { readFile } = await import('node:fs/promises');
    const { default: init } = await import('./graphrs.js');
    const bytes = await readFile(new URL('./graphrs_bg.wasm', import.meta.url));
    wasmInstance = await init(bytes);
  }
  return wasmInstance!;
}
```

### 3.3 API Design — Ergonomic TypeScript

```typescript
// User-facing API example
import { Graph } from "@graphrs/core";
import { louvain, type CommunityResult } from "@graphrs/community";
import { pagerank } from "@graphrs/centrality";
import { layoutFR, type LayoutResult } from "@graphrs/layout";

// Graph construction (synchronous — no WASM needed)
const g = new Graph<{ name: string }, { weight: number }>();
g.addNode(0, { name: "Alice" });
g.addNode(1, { name: "Bob" });
g.addEdge(0, 1, { weight: 1.5 });

// Or from edge list
const g2 = Graph.fromEdges([[0,1],[1,2],[2,0],[2,3],[3,4],[4,5],[5,3]]);

// Algorithm calls are async (first call inits WASM, subsequent are fast)
const communities: CommunityResult = await louvain(g2);
// { membership: [0,0,0,1,1,1], modularity: 0.357, clusters: 2 }

const pr = await pagerank(g2, { damping: 0.85 });
// { scores: [0.12, 0.15, 0.23, 0.18, 0.16, 0.16] }

const layout: LayoutResult = await layoutFR(g2, { iterations: 500 });
// { positions: [[x,y], [x,y], ...] }

// Integration with AntV G6
import G6 from "@antv/g6";
const data = g2.toG6Format(layout); // { nodes: [...], edges: [...] }
```

### 3.4 Dual Environment Support (Browser + Node.js)

```jsonc
// packages/core/package.json
{
  "exports": {
    ".": {
      "browser": {
        "import": "./dist/browser/index.js"
      },
      "node": {
        "import": "./dist/node/index.js"
      },
      "default": {
        "import": "./dist/browser/index.js"
      }
    }
  }
}
```

The only difference: how `.wasm` is loaded (fetch vs fs.readFile).

### 3.5 Web Worker Support

```typescript
// @graphrs/core/worker
import { createGraphWorker } from "@graphrs/core/worker";

const worker = createGraphWorker();
// All computation runs off main thread
const result = await worker.run(async (graphrs) => {
  const g = graphrs.Graph.fromEdges([[0,1],[1,2]]);
  return graphrs.pagerank(g);
});
worker.terminate();
```

---

## 4. Type System

```typescript
// packages/core/src/types.ts

export type VertexId = number;
export type EdgeId = number;

export interface GraphOptions {
  directed?: boolean;  // default: false
}

export interface NodeData {
  [key: string]: unknown;
}

export interface EdgeData {
  weight?: number;
  [key: string]: unknown;
}

export class Graph<N extends NodeData = {}, E extends EdgeData = {}> {
  readonly directed: boolean;
  
  // Construction
  static fromEdges(edges: [number, number][], options?: GraphOptions): Graph;
  static fromAdjacencyMatrix(matrix: number[][], options?: GraphOptions): Graph;
  static fromGraphML(xml: string): Promise<Graph>;
  
  // Mutation
  addNode(id: VertexId, data?: N): this;
  addEdge(source: VertexId, target: VertexId, data?: E): this;
  removeNode(id: VertexId): this;
  removeEdge(source: VertexId, target: VertexId): this;
  
  // Queries
  nodeCount(): number;
  edgeCount(): number;
  hasNode(id: VertexId): boolean;
  hasEdge(source: VertexId, target: VertexId): boolean;
  neighbors(id: VertexId): VertexId[];
  degree(id: VertexId): number;
  
  // Serialization
  toJSON(): SerializedGraph;
  toG6Format(layout?: LayoutResult): G6GraphData;
  toReactFlowFormat(layout?: LayoutResult): ReactFlowData;
  toCytoscapeFormat(layout?: LayoutResult): CytoscapeData;
  
  // Internal — serialize to WASM format
  _toWasmEdges(): Uint32Array;
}

// Algorithm result types
export interface CommunityResult {
  membership: number[];
  modularity: number;
  clusters: number;
}

export interface CentralityResult {
  scores: number[];
}

export interface LayoutResult {
  positions: [number, number][];  // 2D
}

export interface Layout3DResult {
  positions: [number, number, number][];  // 3D
}

export interface PathResult {
  path: number[];
  distance: number;
}

export interface FlowResult {
  value: number;
  flow: number[];
}
```

---

## 5. Build Pipeline

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags: ['v*']

jobs:
  build-wasm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          repository: Totoro-jam/rust-igraph
      - uses: dtolnay/rust-toolchain@stable
        with:
          targets: wasm32-unknown-unknown
      - run: cargo install wasm-pack
      - run: wasm-pack build crates/igraph-wasm --target web --out-dir pkg
      - run: wasm-opt -O3 pkg/igraph_wasm_bg.wasm -o pkg/igraph_wasm_bg.wasm
      - uses: actions/upload-artifact@v4
        with:
          name: wasm-pkg
          path: crates/igraph-wasm/pkg/

  publish:
    needs: build-wasm
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install
      - run: cp wasm-pkg/*.wasm packages/core/wasm/
      - run: cp wasm-pkg/*.js packages/core/wasm/
      - run: pnpm turbo build
      - run: pnpm turbo test
      - run: pnpm -r publish --access public
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 6. Execution Plan (Step by Step)

### Phase 1: Foundation (Week 1-2)

| Step | Task | Output |
|------|------|--------|
| 1.1 | Create repo `graphrs`, init pnpm workspace + turborepo | Repo skeleton |
| 1.2 | Build WASM binary from rust-igraph, copy to `packages/core/wasm/` | `.wasm` + `.js` glue |
| 1.3 | Implement `@graphrs/core`: Graph class, wasm-loader, types | `@graphrs/core` working |
| 1.4 | Add dual-env support (browser fetch / Node fs) | Tests pass in both |
| 1.5 | Add vitest test suite for core | 90%+ coverage on core |

### Phase 2: Algorithm Packages (Week 3-4)

| Step | Task | Output |
|------|------|--------|
| 2.1 | `@graphrs/community` — louvain, leiden, infomap, walktrap, etc. | Package published |
| 2.2 | `@graphrs/centrality` — pagerank, betweenness, closeness, etc. | Package published |
| 2.3 | `@graphrs/path` — dijkstra, bfs, dfs, shortest paths | Package published |
| 2.4 | `@graphrs/layout` — FR, KK, sugiyama, circle, grid | Package published |
| 2.5 | `@graphrs/generators` — ER, barabasi, famous, lattice | Package published |
| 2.6 | `@graphrs/io` — graphml, gml, dot, edgelist | Package published |
| 2.7 | `@graphrs/operators` — union, intersection, simplify | Package published |
| 2.8 | `@graphrs/flow` — max-flow, min-cut, connectivity | Package published |
| 2.9 | `@graphrs/isomorphism` — VF2, canonical, automorphism | Package published |

### Phase 3: Adapters & Web Worker (Week 5)

| Step | Task | Output |
|------|------|--------|
| 3.1 | `@graphrs/core/worker` — Web Worker wrapper with Comlink | Non-blocking compute |
| 3.2 | `@graphrs/react-flow` — `useGraphrsLayout` hook (drop-in for useForceLayout) | Adapter pkg |
| 3.3 | `@graphrs/g6` — G6 custom layout class + analysis plugin | Adapter pkg |
| 3.4 | Persistent WasmGraph handle (graph lives in WASM memory across calls) | Zero re-serialization |
| 3.5 | Progressive layout mode (tick-by-tick with requestAnimationFrame sync) | Smooth animation |

### Phase 4: Demo & Benchmarks (Week 6)

| Step | Task | Output |
|------|------|--------|
| 4.1 | Benchmark: d3-force vs @graphrs FR at 1k/5k/10k/50k nodes | JSON results |
| 4.2 | Benchmark: dagre vs @graphrs Sugiyama for hierarchical layouts | JSON results |
| 4.3 | React Flow demo app with slider (100→50k nodes, real-time comparison) | Vercel deploy |
| 4.4 | G6 demo: 10k-node social network with WASM community + centrality overlay | Vercel deploy |
| 4.5 | Bundle size analysis + wasm-opt | Badge: core < 3KB JS + 250KB .wasm gz |

### Phase 5: Documentation & Launch (Week 7)

| Step | Task | Output |
|------|------|--------|
| 5.1 | Documentation site (Starlight / VitePress) | Live docs |
| 5.2 | README with benchmark GIF + comparison table | npm-ready |
| 5.3 | Publish v0.1.0 to npm (all packages) | `@graphrs/*` live |
| 5.4 | Blog post / tweet with demo link | Launch awareness |

---

## 7. Licensing

```
packages/*/src/**    → MIT (your original TypeScript code)
packages/core/wasm/  → GPL-2.0-or-later (compiled from rust-igraph)
```

- `LICENSE` (root): MIT — covers all TypeScript source
- `LICENSE-WASM`: GPL-2.0-or-later — covers the `.wasm` binary
- Each package's `package.json` has `"license": "MIT"` 
- README notes: "This package bundles a WebAssembly binary compiled from
  [rust-igraph](https://github.com/Totoro-jam/rust-igraph) (GPL-2.0-or-later).
  The TypeScript wrapper code is MIT licensed."

**Legal basis**: The `.wasm` is a compiled binary distributed alongside MIT wrapper code. This is analogous to shipping a GPL library as a system dependency. The TS wrapper is your original creative work (not a derivative of the GPL code), so MIT applies to it. The GPL only requires that you: (1) include the GPL license text, (2) provide access to the source (link to rust-igraph repo), (3) note that the .wasm is GPL.

---

## 8. Tech Stack

| Tool | Purpose |
|------|---------|
| **pnpm** | Package manager (workspace support) |
| **Turborepo** | Monorepo build orchestration |
| **tsup** | Fast ESM/CJS bundling per package |
| **Vitest** | Testing framework |
| **TypeScript 5.5+** | Strict mode, satisfies, const type params |
| **Changesets** | Version management + changelogs |
| **wasm-pack** | Build .wasm from rust-igraph |
| **wasm-opt** | Optimize .wasm size (-O3) |

---

## 9. Bundle Size Budget

| Package | JS (gzipped) | Notes |
|---------|-------------|-------|
| `@graphrs/core` | ~3KB + 250KB .wasm | .wasm loaded lazily on first algo call |
| `@graphrs/community` | ~1.5KB | Thin wrappers |
| `@graphrs/centrality` | ~1KB | Thin wrappers |
| `@graphrs/layout` | ~1.2KB | Thin wrappers |
| `@graphrs/path` | ~1KB | Thin wrappers |
| Other packages | ~0.5-1KB each | Thin wrappers |

The .wasm binary (~250KB gzip) is the fixed cost. The TS wrappers are negligible.
Tree-shaking eliminates unused wrapper code; the .wasm loads only on first use.

---

## 10. API Conventions

1. **All algorithm functions are async** (WASM init is async)
2. **First argument is always the Graph instance**
3. **Options are a typed object (not positional args)**
4. **Results are typed objects with named fields**
5. **Errors throw `GraphError` with code + message**

```typescript
// Pattern for every algorithm wrapper:
export async function louvain(
  graph: Graph,
  options?: LouvainOptions
): Promise<CommunityResult> {
  const wasm = await getWasm();
  const wasmGraph = graph._toWasmGraph(wasm);
  const raw = wasmGraph.louvain();  // calls WASM, returns JSON string
  const parsed = JSON.parse(raw);
  return {
    membership: parsed.membership,
    modularity: parsed.modularity,
    clusters: new Set(parsed.membership).size,
  };
}
```

---

## 11. Compatibility Targets

- **Browser**: Chrome 89+, Firefox 89+, Safari 15+, Edge 89+ (all support WASM + ESM)
- **Node.js**: 18+ (LTS, supports ESM + WASM)
- **Bundlers**: Vite 5+, webpack 5+, Rollup 4+, esbuild 0.19+
- **TypeScript**: 5.0+

---

## 12. Key Files to Create First

```bash
# 1. Init repo
mkdir graphrs && cd graphrs
pnpm init
echo 'packages:\n  - "packages/*"' > pnpm-workspace.yaml

# 2. Create core package
mkdir -p packages/core/src packages/core/wasm
# Copy .wasm from rust-igraph build

# 3. Core implementation order:
#    types.ts → errors.ts → wasm-loader.ts → graph.ts → index.ts

# 4. First algorithm package (community as proof of concept):
mkdir -p packages/community/src
#    louvain.ts → index.ts → package.json → test

# 5. Verify tree-shaking works:
#    Create a test app that imports only louvain
#    Build with Vite, check bundle only includes community + core
```

---

## 13. Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| WASM size too large | wasm-opt -O3, consider splitting into feature-gated crates later |
| GPL license confusion | Clear LICENSE-WASM file + README notice + legal opinion in docs |
| Slow first load (WASM init) | Preload hint: `<link rel="preload" href="graphrs_bg.wasm" as="fetch">` |
| API breaks in rust-igraph | Pin WASM binary version, decouple release cycles |
| npm scope squatting | Register `@graphrs` scope immediately on npmjs.com |

---

## Summary for AI Executor

You are building `@graphrs` — a modular TypeScript graph library powered by a Rust/WASM backend. 

**Key constraints:**
- MIT license for all TS code; GPL notice only for bundled .wasm binary
- Every package must have `"sideEffects": false` and ESM subpath exports
- All algorithm calls are `async` (WASM is lazy-loaded)
- First argument is always `Graph`, second is optional typed options object
- Must work in both Browser and Node.js without any config
- Use pnpm + turborepo + tsup + vitest + changesets
- Target: `@graphrs/core` + 9 algorithm packages

**Start with:** Phase 1 (core package with WASM loader + Graph class), then Phase 2 (one algorithm package at a time), then Phase 3 (integrations).

The WASM binary source is at `github.com/Totoro-jam/rust-igraph`, crate `igraph-wasm`. Build with: `wasm-pack build crates/igraph-wasm --target web`.
