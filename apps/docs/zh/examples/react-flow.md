# React Flow 集成

[React Flow](https://reactflow.dev/) 是一个用于构建交互式节点界面的 React 库。graphrs 提供了内置的 `toReactFlowFormat()` 序列化器。

## 安装

```bash
npm install @graphrs/core @graphrs/layout @xyflow/react
```

## 基本示例

```tsx
import { useCallback, useEffect, useState } from 'react';
import { ReactFlow, Background, Controls, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Graph } from '@graphrs/core';
import { layoutFR } from '@graphrs/layout';

function GraphView() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    async function buildGraph() {
      const graph = Graph.fromEdges([
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [0, 2],
      ]);

      // 添加标签
      for (const id of graph.nodes()) {
        graph.addNode(id, { label: `Node ${id}` });
      }

      // 计算布局
      const layout = await layoutFR(graph);

      // 转换为 React Flow 格式
      const data = graph.toReactFlowFormat(layout);
      setNodes(data.nodes);
      setEdges(data.edges);
    }

    buildGraph();
  }, []);

  return (
    <div style={{ width: '100%', height: 500 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
```

## 数据格式

`toReactFlowFormat()` 产生 React Flow 所期望的格式：

```typescript
{
  nodes: [
    { id: "0", position: { x: 120.5, y: 80.3 }, data: { label: "Node 0" } },
    { id: "1", position: { x: 200.1, y: 150.7 }, data: { label: "Node 1" } },
  ],
  edges: [
    { id: "e-0", source: "0", target: "1" },
  ]
}
```

- 未提供布局时，位置默认为 `{ x: 0, y: 0 }`
- 边的 ID 自动生成为 `e-{index}`
- 节点的 `data` 包含节点的自定义数据

## 配合中心性分析

```tsx
import { pagerank } from '@graphrs/centrality';

async function buildGraph() {
  const graph = Graph.fromEdges([
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [0, 2],
  ]);

  const pr = await pagerank(graph);
  const layout = await layoutFR(graph);
  const data = graph.toReactFlowFormat(layout);

  // 用中心性数据丰富节点
  data.nodes.forEach((node, i) => {
    node.data = {
      label: `Node ${node.id} (PR: ${pr.scores[i]!.toFixed(3)})`,
    };
  });

  return data;
}
```
