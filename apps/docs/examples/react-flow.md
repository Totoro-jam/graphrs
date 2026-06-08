# React Flow Integration

[React Flow](https://reactflow.dev/) is a React library for building interactive node-based UIs. graphrs provides a built-in `toReactFlowFormat()` serializer.

## Installation

```bash
npm install @graphrs/core @graphrs/layout @xyflow/react
```

## Basic Example

```tsx
import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Graph } from '@graphrs/core';
import { layoutFR } from '@graphrs/layout';

function GraphView() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    async function buildGraph() {
      const graph = Graph.fromEdges([
        [0, 1], [1, 2], [2, 3], [3, 0], [0, 2],
      ]);

      // Add labels
      for (const id of graph.nodes()) {
        graph.addNode(id, { label: `Node ${id}` });
      }

      // Compute layout
      const layout = await layoutFR(graph);

      // Convert to React Flow format
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

## Data Format

`toReactFlowFormat()` produces the format React Flow expects:

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

- Positions default to `{ x: 0, y: 0 }` when no layout is provided
- Edge IDs are auto-generated as `e-{index}`
- Node `data` contains the node's custom data

## With Centrality Analysis

```tsx
import { pagerank } from '@graphrs/centrality';

async function buildGraph() {
  const graph = Graph.fromEdges([
    [0, 1], [1, 2], [2, 3], [3, 0], [0, 2],
  ]);

  const pr = await pagerank(graph);
  const layout = await layoutFR(graph);
  const data = graph.toReactFlowFormat(layout);

  // Enrich nodes with centrality data
  data.nodes.forEach((node, i) => {
    node.data = {
      label: `Node ${node.id} (PR: ${pr.scores[i]!.toFixed(3)})`,
    };
  });

  return data;
}
```
