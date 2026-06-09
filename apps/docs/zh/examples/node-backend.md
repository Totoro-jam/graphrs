# Node.js 后端

graphrs 在 Node.js 中可以无缝运行，用于服务端图分析。这对于构建处理图数据的 API、批量分析流水线或命令行工具非常有用。

## 安装

```bash
npm install @graphrs/core @graphrs/community @graphrs/centrality @graphrs/path
```

## Express API 示例

```typescript
import express from 'express';
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';
import { pagerank } from '@graphrs/centrality';
import { dijkstra } from '@graphrs/path';

const app = express();
app.use(express.json());

// 分析图
app.post('/api/analyze', async (req, res) => {
  const { edges, directed } = req.body;

  const graph = Graph.fromEdges(edges, { directed });

  const [communities, ranks] = await Promise.all([louvain(graph), pagerank(graph)]);

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

// 查找最短路径
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

## 批量处理

```typescript
import { readFile } from 'node:fs/promises';
import { Graph } from '@graphrs/core';
import { pagerank } from '@graphrs/centrality';

async function processGraphFile(path: string) {
  const raw = await readFile(path, 'utf8');
  const data = JSON.parse(raw);
  const graph = Graph.fromJSON(data);

  const pr = await pagerank(graph);

  // 查找 PageRank 前 10 的节点
  const ranked = pr.scores
    .map((score, id) => ({ id, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return ranked;
}
```

## 性能考虑

- WASM 在每个进程中只加载一次，在所有请求之间共享
- 对于大型图（100k+ 条边），建议在 Worker 线程中运行分析
- 图的构建是纯 TypeScript 操作 —— 构建图没有 WASM 开销
- WASM 执行在异步包装器内是同步的（对于中小型图不会阻塞事件循环）

## Worker 线程示例

```typescript
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

if (isMainThread) {
  // 主线程：委派重量级计算
  const worker = new Worker(new URL(import.meta.url));
  worker.postMessage({
    edges: [
      [0, 1],
      [1, 2],
      [2, 0],
    ],
  });
  worker.on('message', (result) => {
    console.log('Analysis result:', result);
  });
} else {
  // Worker 线程：运行图分析
  const { Graph } = await import('@graphrs/core');
  const { pagerank } = await import('@graphrs/centrality');

  parentPort!.on('message', async ({ edges }) => {
    const graph = Graph.fromEdges(edges);
    const pr = await pagerank(graph);
    parentPort!.postMessage({ scores: pr.scores });
  });
}
```
