# Node.js Backend

graphrs works seamlessly in Node.js for server-side graph analysis. WASM loads once per process and stays in memory — subsequent calls have zero initialization overhead. This makes graphrs ideal for building APIs, batch pipelines, and CLI tools that process graph data.

**Performance**: WASM execution is synchronous within the async wrapper. For small-to-medium graphs (<50k edges), there's no event loop blocking. For larger graphs, offload to a Worker thread (example below).

## Installation

```bash
npm install @graphrs/core @graphrs/community @graphrs/centrality @graphrs/path @graphrs/layout
```

## Express API — Graph Analysis Endpoint

```typescript
import express from 'express';
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';
import { pagerank, betweenness } from '@graphrs/centrality';
import { dijkstra } from '@graphrs/path';

const app = express();
app.use(express.json({ limit: '10mb' }));

// POST /api/analyze — full graph analysis
app.post('/api/analyze', async (req, res) => {
  const { edges, directed = false } = req.body as {
    edges: [number, number][];
    directed?: boolean;
  };

  if (!edges?.length) {
    return res.status(400).json({ error: 'edges array is required' });
  }

  const graph = Graph.fromEdges(edges, { directed });

  const [communities, ranks, bc] = await Promise.all([
    louvain(graph),
    pagerank(graph),
    betweenness(graph),
  ]);

  res.json({
    nodeCount: graph.nodeCount(),
    edgeCount: graph.edgeCount(),
    communities: {
      count: communities.clusters,
      modularity: communities.modularity,
      membership: communities.membership,
    },
    pagerank: ranks.scores,
    betweenness: bc.scores,
  });
});

// POST /api/shortest-path — Dijkstra shortest path
app.post('/api/shortest-path', async (req, res) => {
  const { edges, source, target, weighted = false } = req.body as {
    edges: [number, number, number?][];
    source: number;
    target: number;
    weighted?: boolean;
  };

  const graph = Graph.fromEdges(edges);
  const result = await dijkstra(graph, source, target);

  res.json({
    path: result.path,
    distance: result.distance,
    hops: result.path.length - 1,
  });
});

// POST /api/layout — compute layout positions
app.post('/api/layout', async (req, res) => {
  const { edges, algorithm = 'fruchterman-reingold', width = 800, height = 600 } = req.body;

  const { layoutFR, layoutKK, layoutCircle } = await import('@graphrs/layout');
  const graph = Graph.fromEdges(edges);

  const layoutFn = { 'fruchterman-reingold': layoutFR, 'kamada-kawai': layoutKK, circle: layoutCircle }[algorithm];
  if (!layoutFn) {
    return res.status(400).json({ error: `Unknown algorithm: ${algorithm}` });
  }

  const layout = await layoutFn(graph);

  // Normalize positions to requested dimensions
  const xs = layout.positions.map((p) => p[0]);
  const ys = layout.positions.map((p) => p[1]);
  const [minX, maxX] = [Math.min(...xs), Math.max(...xs)];
  const [minY, maxY] = [Math.min(...ys), Math.max(...ys)];
  const scaleX = width / (maxX - minX || 1);
  const scaleY = height / (maxY - minY || 1);

  const positions = layout.positions.map((p, i) => ({
    id: i,
    x: (p[0] - minX) * scaleX,
    y: (p[1] - minY) * scaleY,
  }));

  res.json({ positions });
});

app.listen(3000, () => console.log('Graph API on :3000'));
```

### Usage

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"edges":[[0,1],[1,2],[2,0],[3,4],[4,5],[5,3],[2,3]]}'
```

## Hono (Edge Runtime Compatible)

```typescript
import { Hono } from 'hono';
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';
import { pagerank } from '@graphrs/centrality';

const app = new Hono();

app.post('/analyze', async (c) => {
  const { edges } = await c.req.json<{ edges: [number, number][] }>();
  const graph = Graph.fromEdges(edges);

  const [communities, pr] = await Promise.all([
    louvain(graph),
    pagerank(graph),
  ]);

  return c.json({
    communities: communities.membership,
    modularity: communities.modularity,
    pagerank: pr.scores,
  });
});

export default app;
```

## Batch Processing — Large File Analysis

```typescript
import { readFile, writeFile } from 'node:fs/promises';
import { Graph } from '@graphrs/core';
import { pagerank } from '@graphrs/centrality';
import { louvain } from '@graphrs/community';

interface GraphJSON {
  nodes: number[];
  edges: [number, number][];
}

async function analyzeGraphFile(inputPath: string, outputPath: string) {
  const raw = await readFile(inputPath, 'utf8');
  const data: GraphJSON = JSON.parse(raw);
  const graph = Graph.fromEdges(data.edges);

  console.log(`Graph: ${graph.nodeCount()} nodes, ${graph.edgeCount()} edges`);

  const start = performance.now();

  const [pr, communities] = await Promise.all([
    pagerank(graph),
    louvain(graph),
  ]);

  const elapsed = performance.now() - start;
  console.log(`Analysis completed in ${elapsed.toFixed(1)}ms`);

  // Top-10 nodes by PageRank
  const ranked = pr.scores
    .map((score, id) => ({ id, score, community: communities.membership[id] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const result = {
    summary: {
      nodeCount: graph.nodeCount(),
      edgeCount: graph.edgeCount(),
      communityCount: communities.clusters,
      modularity: communities.modularity,
      analysisTimeMs: elapsed,
    },
    topNodes: ranked,
  };

  await writeFile(outputPath, JSON.stringify(result, null, 2));
  console.log(`Results written to ${outputPath}`);
}

// Usage: npx tsx analyze.ts graph.json output.json
const [input, output] = process.argv.slice(2);
if (input && output) analyzeGraphFile(input, output);
```

## Worker Thread — Heavy Computation

For graphs with 50k+ edges, offload to a Worker thread to avoid blocking the event loop:

```typescript
// worker-pool.ts
import { Worker } from 'node:worker_threads';
import { cpus } from 'node:os';

interface AnalysisResult {
  pagerank: number[];
  communities: number[];
  modularity: number;
}

export function analyzeInWorker(edges: [number, number][]): Promise<AnalysisResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./graph-worker.ts', import.meta.url));
    worker.postMessage({ edges });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
    });
  });
}
```

```typescript
// graph-worker.ts
import { parentPort } from 'node:worker_threads';
import { Graph } from '@graphrs/core';
import { pagerank } from '@graphrs/centrality';
import { louvain } from '@graphrs/community';

parentPort!.on('message', async ({ edges }) => {
  const graph = Graph.fromEdges(edges);

  const [pr, communities] = await Promise.all([
    pagerank(graph),
    louvain(graph),
  ]);

  parentPort!.postMessage({
    pagerank: pr.scores,
    communities: communities.membership,
    modularity: communities.modularity,
  });
});
```

```typescript
// server.ts — using the worker pool
import express from 'express';
import { analyzeInWorker } from './worker-pool.js';

const app = express();
app.use(express.json({ limit: '50mb' }));

app.post('/api/analyze-large', async (req, res) => {
  const { edges } = req.body;
  const result = await analyzeInWorker(edges);
  res.json(result);
});
```

## CLI Tool

```typescript
#!/usr/bin/env node
// graphrs-cli.ts — analyze graphs from the command line
import { readFile } from 'node:fs/promises';
import { Graph } from '@graphrs/core';
import { pagerank } from '@graphrs/centrality';
import { louvain } from '@graphrs/community';
import { layoutFR } from '@graphrs/layout';

const args = process.argv.slice(2);
const command = args[0];
const filePath = args[1];

if (!command || !filePath) {
  console.log('Usage: graphrs-cli <command> <file.json>');
  console.log('Commands: analyze, layout, communities, pagerank');
  process.exit(1);
}

const raw = await readFile(filePath, 'utf8');
const data = JSON.parse(raw);
const graph = Graph.fromEdges(data.edges ?? data);

switch (command) {
  case 'analyze': {
    const [pr, comm] = await Promise.all([pagerank(graph), louvain(graph)]);
    console.log(`Nodes: ${graph.nodeCount()}`);
    console.log(`Edges: ${graph.edgeCount()}`);
    console.log(`Communities: ${comm.clusters} (modularity: ${comm.modularity.toFixed(4)})`);
    console.log(`Top PageRank: node ${pr.scores.indexOf(Math.max(...pr.scores))} (${Math.max(...pr.scores).toFixed(4)})`);
    break;
  }
  case 'communities': {
    const comm = await louvain(graph);
    console.log(JSON.stringify({ clusters: comm.clusters, modularity: comm.modularity, membership: comm.membership }));
    break;
  }
  case 'pagerank': {
    const pr = await pagerank(graph);
    const ranked = pr.scores.map((s, i) => ({ node: i, score: s })).sort((a, b) => b.score - a.score);
    ranked.slice(0, 20).forEach((r) => console.log(`  Node ${r.node}: ${r.score.toFixed(6)}`));
    break;
  }
  case 'layout': {
    const layout = await layoutFR(graph);
    console.log(JSON.stringify(layout.positions.map((p, i) => ({ id: i, x: p[0], y: p[1] }))));
    break;
  }
  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}
```

## Performance Benchmarks

Measured on Node.js 22, Apple M1 Pro, single thread:

| Operation | 1k nodes | 10k nodes | 100k nodes |
|-----------|----------|-----------|------------|
| Graph construction | <1ms | ~5ms | ~50ms |
| PageRank | ~5ms | ~100ms | ~2s |
| Louvain | ~3ms | ~80ms | ~1.5s |
| Betweenness | ~10ms | ~500ms | ~60s |
| FR Layout (500 iter) | ~30ms | ~800ms | ~15s |
| Dijkstra (single pair) | <1ms | ~10ms | ~200ms |

WASM initialization: ~20ms on first call, then cached in memory.

## Deployment Considerations

- **WASM binary**: Ships with the npm package — no separate compilation step
- **Memory**: WASM linear memory grows as needed; for 100k-node graphs, expect ~50-100MB
- **Startup**: First algorithm call initializes WASM (~20ms); subsequent calls are instant
- **Docker**: Works in standard Node.js images — no special WASM configuration needed
- **Serverless**: Cold start includes WASM init; use provisioned concurrency for latency-sensitive APIs
