# React Flow 集成

[React Flow](https://reactflow.dev/)（by xyflow）是一个用于构建交互式节点界面的 React 库。`@graphrs/react-flow` 包提供 React Hook 和适配器，实现无缝集成。

## 安装

```bash
npm install @graphrs/react-flow @xyflow/react
```

`@graphrs/react-flow` 已包含 `@graphrs/core` 和 `@graphrs/layout` 作为依赖。

## 快速开始 — `useGraphrsLayout` Hook

使用 graphrs 和 React Flow 最简单的方式：一个自动布局节点的 Hook。

```tsx
import { ReactFlow, Background, Controls } from '@xyflow/react';
import { useGraphrsLayout } from '@graphrs/react-flow';
import '@xyflow/react/dist/style.css';

const initialNodes = [
  { id: 'a', data: { label: 'Alice' }, position: { x: 0, y: 0 } },
  { id: 'b', data: { label: 'Bob' }, position: { x: 0, y: 0 } },
  { id: 'c', data: { label: 'Carol' }, position: { x: 0, y: 0 } },
  { id: 'd', data: { label: 'Dave' }, position: { x: 0, y: 0 } },
];

const initialEdges = [
  { id: 'e1', source: 'a', target: 'b' },
  { id: 'e2', source: 'b', target: 'c' },
  { id: 'e3', source: 'c', target: 'd' },
  { id: 'e4', source: 'd', target: 'a' },
];

function GraphView() {
  const { nodes, edges, isLayouting } = useGraphrsLayout(
    initialNodes,
    initialEdges,
    { algorithm: 'fruchterman-reingold', iterations: 500 },
  );

  return (
    <div style={{ width: '100%', height: 500 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
      {isLayouting && <div className="loading">正在计算布局...</div>}
    </div>
  );
}
```

当 `nodes` 或 `edges` 变化时，Hook 会自动重新运行布局。

### 可用布局算法

| 算法 | 键名 |
|------|------|
| Fruchterman-Reingold | `fruchterman-reingold` |
| Kamada-Kawai | `kamada-kawai` |
| Circle | `circle` |
| Grid | `grid` |
| Star | `star` |
| Random | `random` |

### 手动触发布局

```tsx
function GraphView() {
  const { nodes, edges, runLayout } = useGraphrsLayout(
    initialNodes,
    initialEdges,
    { enabled: false },  // 禁用自动布局
  );

  return (
    <div style={{ width: '100%', height: 500 }}>
      <button onClick={() => runLayout('kamada-kawai')}>
        运行 Kamada-Kawai 布局
      </button>
      <button onClick={() => runLayout('circle')}>
        环形布局
      </button>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
      </ReactFlow>
    </div>
  );
}
```

## 底层适配器

对于自定义管线，可以直接使用适配器函数。

### `reactFlowToGraph(nodes, edges, options?)`

将 React Flow 节点/边转换为 graphrs `Graph`。

```typescript
import { reactFlowToGraph } from '@graphrs/react-flow';

const { graph, idMap } = reactFlowToGraph(nodes, edges, { directed: true });
// graph: 带数字 ID (0, 1, 2, ...) 的 Graph
// idMap: Map<number, string> — 数字索引 → React Flow 字符串 id
```

### `applyLayout(nodes, layout, options?)`

将 graphrs `LayoutResult` 应用到 React Flow 节点（不可变 — 返回新数组）。

```typescript
import { applyLayout } from '@graphrs/react-flow';
import { layoutKK } from '@graphrs/layout';

const { graph } = reactFlowToGraph(nodes, edges);
const layout = await layoutKK(graph);

const layoutedNodes = applyLayout(nodes, layout, { scale: 250 });
// 每个节点获得来自布局的 position.x 和 position.y
```

`scale` 选项（默认：`200`）将原始布局坐标乘以此值以产生合理的像素位置。

## 完整示例 — 分析 + 交互式布局

```tsx
import { useState, useCallback } from 'react';
import { ReactFlow, Background, Controls, Panel, type Node, type Edge } from '@xyflow/react';
import { useGraphrsLayout, reactFlowToGraph } from '@graphrs/react-flow';
import { pagerank } from '@graphrs/centrality';
import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
  { id: 'a', data: { label: 'Alice' }, position: { x: 0, y: 0 } },
  { id: 'b', data: { label: 'Bob' }, position: { x: 0, y: 0 } },
  { id: 'c', data: { label: 'Carol' }, position: { x: 0, y: 0 } },
  { id: 'd', data: { label: 'Dave' }, position: { x: 0, y: 0 } },
  { id: 'e', data: { label: 'Eve' }, position: { x: 0, y: 0 } },
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'a', target: 'b' },
  { id: 'e2', source: 'a', target: 'c' },
  { id: 'e3', source: 'b', target: 'd' },
  { id: 'e4', source: 'c', target: 'd' },
  { id: 'e5', source: 'd', target: 'e' },
  { id: 'e6', source: 'e', target: 'a' },
];

function AnalysisGraph() {
  const { nodes, edges, runLayout } = useGraphrsLayout(
    initialNodes,
    initialEdges,
    { algorithm: 'fruchterman-reingold' },
  );

  const [scores, setScores] = useState<Map<string, number>>(new Map());

  const computePageRank = useCallback(async () => {
    const { graph, idMap } = reactFlowToGraph(nodes, edges);
    const pr = await pagerank(graph);

    const scoreMap = new Map<string, number>();
    for (let i = 0; i < pr.scores.length; i++) {
      const nodeId = idMap.get(i);
      if (nodeId) scoreMap.set(nodeId, pr.scores[i]!);
    }
    setScores(scoreMap);
  }, [nodes, edges]);

  const styledNodes = nodes.map((node) => {
    const score = scores.get(node.id);
    if (score === undefined) return node;
    return {
      ...node,
      data: { label: `${node.data.label} (${score.toFixed(3)})` },
      style: { width: 40 + score * 300, height: 40 + score * 300 },
    };
  });

  return (
    <div style={{ width: '100%', height: 600 }}>
      <ReactFlow nodes={styledNodes} edges={edges} fitView>
        <Background />
        <Controls />
        <Panel position="top-left">
          <button onClick={() => runLayout('kamada-kawai')}>KK 布局</button>
          <button onClick={() => runLayout('circle')}>环形</button>
          <button onClick={computePageRank}>计算 PageRank</button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
```

## 直接使用 `@graphrs/core`

对于不需要 Hook 的简单场景，可以使用内置序列化器：

```typescript
import { Graph } from '@graphrs/core';
import { layoutFR } from '@graphrs/layout';

const graph = Graph.fromEdges([[0, 1], [1, 2], [2, 3], [3, 0]]);
const layout = await layoutFR(graph);
const data = graph.toReactFlowFormat(layout);
// data.nodes: [{ id: "0", position: { x, y }, data: {} }, ...]
// data.edges: [{ id: "e-0", source: "0", target: "1" }, ...]
```
