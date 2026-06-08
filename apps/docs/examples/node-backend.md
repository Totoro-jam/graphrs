# Node.js Backend

graphrs works seamlessly in Node.js for server-side graph analysis. This is useful for building APIs that process graph data, batch analysis pipelines, or CLI tools.

## Installation

```bash
npm install @graphrs/core @graphrs/community @graphrs/centrality @graphrs/path
```

## Express API Example

```typescript
import express from 'express';
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';
import { pagerank } from '@graphrs/centrality';
import { dijkstra } from '@graphrs/path';

const app = express();
app.use(express.json());

// Analyze a graph
app.post('/api/analyze', async (req, res) => {
  const { edges, directed } = req.body;

  const graph = Graph.fromEdges(edges, { directed });

  const [communities, ranks] = await Promise.all([
    louvain(graph),
    pagerank(graph),
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
  });
});

// Find shortest path
app.post('/api/shortest-path', async (req, res) => {
  const { edges, source, target } = req.body;

  const graph = Graph.fromEdges(edges);
  const result = await dijkstra(graph, { source, target });

  res.json({
    path: result.path,
    distance: result.distance,
  });
});

app.listen(3000);
```

## Batch Processing

```typescript
import { readFile } from 'node:fs/promises';
import { Graph } from '@graphrs/core';
import { pagerank } from '@graphrs/centrality';

async function processGraphFile(path: string) {
  const raw = await readFile(path, 'utf8');
  const data = JSON.parse(raw);
  const graph = Graph.fromJSON(data);

  const pr = await pagerank(graph);

  // Find top-10 nodes by PageRank
  const ranked = pr.scores
    .map((score, id) => ({ id, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return ranked;
}
```

## Performance Considerations

- WASM loads once per process and is reused across requests
- For large graphs (100k+ edges), consider running analysis in a Worker thread
- Graph construction is pure TypeScript — no WASM overhead for building graphs
- WASM execution is synchronous within the async wrapper (no event loop blocking for small-to-medium graphs)

## Worker Thread Example

```typescript
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

if (isMainThread) {
  // Main thread: delegate heavy computation
  const worker = new Worker(new URL(import.meta.url));
  worker.postMessage({
    edges: [[0, 1], [1, 2], [2, 0]],
  });
  worker.on('message', (result) => {
    console.log('Analysis result:', result);
  });
} else {
  // Worker thread: run graph analysis
  const { Graph } = await import('@graphrs/core');
  const { pagerank } = await import('@graphrs/centrality');

  parentPort!.on('message', async ({ edges }) => {
    const graph = Graph.fromEdges(edges);
    const pr = await pagerank(graph);
    parentPort!.postMessage({ scores: pr.scores });
  });
}
```
