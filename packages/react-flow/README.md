# @graphrs/react-flow

> React Flow integration for @graphrs — a React hook and adapters for automatic graph layout powered by Rust/WASM.

[![npm](https://img.shields.io/npm/v/@graphrs/react-flow)](https://www.npmjs.com/package/@graphrs/react-flow)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Totoro-jam/graphrs/blob/main/LICENSE)

## Install

```bash
npm install @graphrs/react-flow @xyflow/react
```

## Usage

### `useGraphrsLayout` Hook

```tsx
import { ReactFlow, Background } from '@xyflow/react';
import { useGraphrsLayout } from '@graphrs/react-flow';
import '@xyflow/react/dist/style.css';

const initialNodes = [
  { id: 'a', data: { label: 'A' }, position: { x: 0, y: 0 } },
  { id: 'b', data: { label: 'B' }, position: { x: 0, y: 0 } },
  { id: 'c', data: { label: 'C' }, position: { x: 0, y: 0 } },
];

const initialEdges = [
  { id: 'e1', source: 'a', target: 'b' },
  { id: 'e2', source: 'b', target: 'c' },
];

function GraphView() {
  const { nodes, edges, isLayouting } = useGraphrsLayout(
    initialNodes,
    initialEdges,
    { algorithm: 'fruchterman-reingold' },
  );

  return (
    <ReactFlow nodes={nodes} edges={edges} fitView>
      <Background />
    </ReactFlow>
  );
}
```

Available algorithms: `fruchterman-reingold` | `kamada-kawai` | `circle` | `grid` | `star` | `random`

### Options

```typescript
interface UseGraphrsLayoutOptions {
  algorithm?: LayoutAlgorithm;  // default: 'fruchterman-reingold'
  iterations?: number;          // FR iterations
  enabled?: boolean;            // auto-layout on change (default: true)
}
```

### Manual Trigger

```tsx
const { nodes, edges, runLayout } = useGraphrsLayout(nodes, edges, { enabled: false });

// Trigger layout manually
await runLayout('kamada-kawai');
```

### Adapters

```typescript
import { reactFlowToGraph, applyLayout } from '@graphrs/react-flow';

const { graph, idMap } = reactFlowToGraph(nodes, edges);
const layoutedNodes = applyLayout(nodes, layoutResult, { scale: 200 });
```

## Peer Dependencies

- `@graphrs/core` ^0.2.0
- `@graphrs/layout` ^0.2.0
- `@xyflow/react` >= 12.0.0
- `react` >= 18.0.0

## Documentation

[Full API reference](https://totoro-jam.github.io/graphrs/api/react-flow)

## License

[MIT](https://github.com/Totoro-jam/graphrs/blob/main/LICENSE)
