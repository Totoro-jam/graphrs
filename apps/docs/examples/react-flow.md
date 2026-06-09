# React Flow Integration

[React Flow](https://reactflow.dev/) (by xyflow) is a React library for building interactive node-based UIs. The `@graphrs/react-flow` package provides a React hook and adapters for seamless integration.

## Installation

```bash
npm install @graphrs/react-flow @xyflow/react
```

`@graphrs/react-flow` includes `@graphrs/core` and `@graphrs/layout` as dependencies.

## Quick Start — `useGraphrsLayout` Hook

The simplest way to use graphrs with React Flow: a hook that automatically layouts your nodes.

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
      {isLayouting && <div className="loading">Computing layout...</div>}
    </div>
  );
}
```

The hook automatically re-runs the layout when `nodes` or `edges` change.

### Available Layout Algorithms

| Algorithm | Key |
|-----------|-----|
| Fruchterman-Reingold | `fruchterman-reingold` |
| Kamada-Kawai | `kamada-kawai` |
| Circle | `circle` |
| Grid | `grid` |
| Star | `star` |
| Random | `random` |

### Manual Layout Trigger

```tsx
function GraphView() {
  const { nodes, edges, runLayout } = useGraphrsLayout(
    initialNodes,
    initialEdges,
    { enabled: false },  // disable auto-layout
  );

  return (
    <div style={{ width: '100%', height: 500 }}>
      <button onClick={() => runLayout('kamada-kawai')}>
        Run Kamada-Kawai Layout
      </button>
      <button onClick={() => runLayout('circle')}>
        Circle Layout
      </button>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
      </ReactFlow>
    </div>
  );
}
```

## Low-level Adapters

For custom pipelines, use the adapter functions directly.

### `reactFlowToGraph(nodes, edges, options?)`

Converts React Flow nodes/edges to a graphrs `Graph`.

```typescript
import { reactFlowToGraph } from '@graphrs/react-flow';

const { graph, idMap } = reactFlowToGraph(nodes, edges, { directed: true });
// graph: Graph with numeric IDs (0, 1, 2, ...)
// idMap: Map<number, string> — numeric index → React Flow string id
```

### `applyLayout(nodes, layout, options?)`

Applies a graphrs `LayoutResult` to React Flow nodes (immutable — returns new array).

```typescript
import { applyLayout } from '@graphrs/react-flow';
import { layoutKK } from '@graphrs/layout';

const { graph } = reactFlowToGraph(nodes, edges);
const layout = await layoutKK(graph);

const layoutedNodes = applyLayout(nodes, layout, { scale: 250 });
// Each node gets position.x and position.y from the layout
```

The `scale` option (default: `200`) multiplies raw layout coordinates to produce reasonable pixel positions.

## Full Example — Analysis + Interactive Layout

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
          <button onClick={() => runLayout('kamada-kawai')}>KK Layout</button>
          <button onClick={() => runLayout('circle')}>Circle</button>
          <button onClick={computePageRank}>Compute PageRank</button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
```

## Using `@graphrs/core` Directly

For simpler cases without the hook, you can use the built-in serializer:

```typescript
import { Graph } from '@graphrs/core';
import { layoutFR } from '@graphrs/layout';

const graph = Graph.fromEdges([[0, 1], [1, 2], [2, 3], [3, 0]]);
const layout = await layoutFR(graph);
const data = graph.toReactFlowFormat(layout);
// data.nodes: [{ id: "0", position: { x, y }, data: {} }, ...]
// data.edges: [{ id: "e-0", source: "0", target: "1" }, ...]
```
