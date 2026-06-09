# @graphrs/react-flow

React hook and adapters for [React Flow](https://reactflow.dev/) (xyflow). Run graphrs layout algorithms on React Flow graphs with a single hook call.

```bash
npm install @graphrs/react-flow @xyflow/react
```

## Hook

### `useGraphrsLayout(nodes, edges, options?)`

React hook that runs a graphrs layout algorithm on React Flow nodes and edges.

```tsx
import { useGraphrsLayout } from '@graphrs/react-flow';

const { nodes, edges, isLayouting, runLayout } = useGraphrsLayout(
  initialNodes,
  initialEdges,
  { algorithm: 'fruchterman-reingold', iterations: 500 },
);
```

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `inputNodes` | `Node[]` | React Flow nodes |
| `inputEdges` | `Edge[]` | React Flow edges |
| `options` | `UseGraphrsLayoutOptions` | Layout configuration |

**Returns**: `UseGraphrsLayoutResult`

```typescript
interface UseGraphrsLayoutResult {
  nodes: Node[];           // Layouted nodes (positions updated)
  edges: Edge[];           // Pass-through of input edges
  isLayouting: boolean;    // True while layout is computing
  runLayout: (algorithm?: LayoutAlgorithm) => Promise<void>;  // Manual trigger
}
```

**Behavior**:
- When `enabled` is `true` (default), the layout auto-runs when nodes/edges change
- When `enabled` is `false`, use `runLayout()` to trigger manually
- `runLayout()` accepts an optional algorithm override

### `UseGraphrsLayoutOptions`

```typescript
interface UseGraphrsLayoutOptions {
  algorithm?: LayoutAlgorithm;   // Default: 'fruchterman-reingold'
  iterations?: number;           // FR iterations (default: internal)
  enabled?: boolean;             // Auto-layout on change (default: true)
}

type LayoutAlgorithm =
  | 'fruchterman-reingold'
  | 'kamada-kawai'
  | 'circle'
  | 'grid'
  | 'star'
  | 'random';
```

## Adapters

### `reactFlowToGraph(nodes, edges, options?)`

Converts React Flow nodes and edges into a graphrs `Graph`.

```typescript
import { reactFlowToGraph } from '@graphrs/react-flow';

const { graph, idMap } = reactFlowToGraph(nodes, edges, { directed: true });
```

- React Flow uses string IDs; graphrs uses numeric IDs
- Nodes are assigned sequential numeric IDs (0, 1, 2, ...) in array order
- Node `data` is preserved as node data in the graph
- Edges referencing unknown nodes are skipped

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `nodes` | `Node[]` | React Flow nodes |
| `edges` | `Edge[]` | React Flow edges |
| `options.directed` | `boolean` | Directed graph (default: `true`) |

**Returns**: `{ graph: Graph; idMap: Map<number, string> }`

### `applyLayout(nodes, layout, options?)`

Applies a graphrs `LayoutResult` to React Flow nodes. Returns a new array (immutable).

```typescript
import { applyLayout } from '@graphrs/react-flow';

const layoutedNodes = applyLayout(nodes, layoutResult, { scale: 200 });
```

Each node receives updated `position.x` and `position.y` from the layout. The `scale` parameter (default: `200`) multiplies raw layout coordinates to produce reasonable pixel positions for React Flow's canvas.

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `nodes` | `Node[]` | React Flow nodes |
| `layout` | `LayoutResult` | graphrs layout result |
| `options.scale` | `number` | Coordinate multiplier (default: `200`) |

**Returns**: `Node[]`

## Peer Dependencies

- `@xyflow/react` >= 12.0.0
- `react` >= 18.0.0
