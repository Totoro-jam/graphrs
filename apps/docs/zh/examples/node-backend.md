# Node.js 后端

graphrs 在 Node.js 中可以无缝运行，用于服务端图分析。WASM 在每个进程中只加载一次并驻留内存 — 后续调用零初始化开销。这使得 graphrs 非常适合构建 API、批处理流水线和处理图数据的命令行工具。

**性能**：WASM 执行在异步包装器内是同步的。对于中小型图（<50k 条边），不会阻塞事件循环。对于更大的图，可以卸载到 Worker 线程（示例见下文）。

## 安装

```bash
npm install @graphrs/core @graphrs/community @graphrs/centrality @graphrs/path @graphrs/layout
```

## Express API — 图分析端点

```typescript
import express from 'express';
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';
import { pagerank, betweenness } from '@graphrs/centrality';
import { dijkstra } from '@graphrs/path';

const app = express();
app.use(express.json({ limit: '10mb' }));

// POST /api/analyze — 完整图分析
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

// POST /api/shortest-path — Dijkstra 最短路径
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

// POST /api/layout — 计算布局坐标
app.post('/api/layout', async (req, res) => {
  const { edges, algorithm = 'fruchterman-reingold', width = 800, height = 600 } = req.body;

  const { layoutFR, layoutKK, layoutCircle } = await import('@graphrs/layout');
  const graph = Graph.fromEdges(edges);

  const layoutFn = { 'fruchterman-reingold': layoutFR, 'kamada-kawai': layoutKK, circle: layoutCircle }[algorithm];
  if (!layoutFn) {
    return res.status(400).json({ error: `Unknown algorithm: ${algorithm}` });
  }

  const layout = await layoutFn(graph);

  // 将坐标归一化到请求的尺寸
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

### 使用示例

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"edges":[[0,1],[1,2],[2,0],[3,4],[4,5],[5,3],[2,3]]}'
```

## Hono（边缘运行时兼容）

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

## 批量处理 — 大文件分析

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

  console.log(`图: ${graph.nodeCount()} 节点, ${graph.edgeCount()} 条边`);

  const start = performance.now();

  const [pr, communities] = await Promise.all([
    pagerank(graph),
    louvain(graph),
  ]);

  const elapsed = performance.now() - start;
  console.log(`分析完成，耗时 ${elapsed.toFixed(1)}ms`);

  // PageRank 前 10 节点
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
  console.log(`结果已写入 ${outputPath}`);
}

// 用法: npx tsx analyze.ts graph.json output.json
const [input, output] = process.argv.slice(2);
if (input && output) analyzeGraphFile(input, output);
```

## Worker 线程 — 重计算任务

对于 50k+ 条边的图，卸载到 Worker 线程以避免阻塞事件循环：

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
// server.ts — 使用 Worker 池
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

## CLI 工具

```typescript
#!/usr/bin/env node
// graphrs-cli.ts — 从命令行分析图
import { readFile } from 'node:fs/promises';
import { Graph } from '@graphrs/core';
import { pagerank } from '@graphrs/centrality';
import { louvain } from '@graphrs/community';
import { layoutFR } from '@graphrs/layout';

const args = process.argv.slice(2);
const command = args[0];
const filePath = args[1];

if (!command || !filePath) {
  console.log('用法: graphrs-cli <command> <file.json>');
  console.log('命令: analyze, layout, communities, pagerank');
  process.exit(1);
}

const raw = await readFile(filePath, 'utf8');
const data = JSON.parse(raw);
const graph = Graph.fromEdges(data.edges ?? data);

switch (command) {
  case 'analyze': {
    const [pr, comm] = await Promise.all([pagerank(graph), louvain(graph)]);
    console.log(`节点: ${graph.nodeCount()}`);
    console.log(`边: ${graph.edgeCount()}`);
    console.log(`社区: ${comm.clusters} (模块度: ${comm.modularity.toFixed(4)})`);
    console.log(`最高 PageRank: 节点 ${pr.scores.indexOf(Math.max(...pr.scores))} (${Math.max(...pr.scores).toFixed(4)})`);
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
    ranked.slice(0, 20).forEach((r) => console.log(`  节点 ${r.node}: ${r.score.toFixed(6)}`));
    break;
  }
  case 'layout': {
    const layout = await layoutFR(graph);
    console.log(JSON.stringify(layout.positions.map((p, i) => ({ id: i, x: p[0], y: p[1] }))));
    break;
  }
  default:
    console.error(`未知命令: ${command}`);
    process.exit(1);
}
```

## 性能基准

在 Node.js 22、Apple M1 Pro、单线程环境下测量：

| 操作 | 1k 节点 | 10k 节点 | 100k 节点 |
|------|---------|----------|-----------|
| 图构建 | <1ms | ~5ms | ~50ms |
| PageRank | ~5ms | ~100ms | ~2s |
| Louvain | ~3ms | ~80ms | ~1.5s |
| 介数中心性 | ~10ms | ~500ms | ~60s |
| FR 布局（500 次迭代） | ~30ms | ~800ms | ~15s |
| Dijkstra（单对） | <1ms | ~10ms | ~200ms |

WASM 初始化：首次调用约 20ms，之后缓存在内存中。

## 部署注意事项

- **WASM 二进制文件**：随 npm 包一起发布 — 无需单独编译步骤
- **内存**：WASM 线性内存按需增长；100k 节点图预计占用约 50-100MB
- **启动**：首次算法调用初始化 WASM（约 20ms）；后续调用即时完成
- **Docker**：在标准 Node.js 镜像中工作 — 无需特殊 WASM 配置
- **Serverless**：冷启动包含 WASM 初始化；延迟敏感 API 建议使用预置并发
