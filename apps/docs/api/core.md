# @graphrs/core

The core package provides the `Graph` class, type definitions, error classes, and the WASM loader. All other packages depend on it.

```bash
npm install @graphrs/core
```

## Graph Class

### Constructor

```typescript
new Graph<N extends NodeData, E extends EdgeData>(options?: GraphOptions)
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `directed` | `boolean` | `false` | Whether edges are directed |

### Static Factories

#### `Graph.fromEdges(edges, options?)`

```typescript
static fromEdges<N, E>(
  edges: [number, number][],
  options?: GraphOptions,
): Graph<N, E>
```

Creates a graph from an array of `[source, target]` pairs. Nodes are auto-created.

#### `Graph.fromAdjacencyMatrix(matrix, options?)`

```typescript
static fromAdjacencyMatrix<N, E>(
  matrix: number[][],
  options?: GraphOptions,
): Graph<N, E>
```

Creates a graph from an adjacency matrix. Non-zero values become edge weights.

#### `Graph.fromJSON(data)`

```typescript
static fromJSON<N, E>(data: SerializedGraph): Graph<N, E>
```

Creates a graph from a serialized JSON object.

### Instance Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `addNode(id, data?)` | `this` | Add a node |
| `addEdge(source, target, data?)` | `this` | Add an edge (auto-creates nodes) |
| `removeNode(id)` | `this` | Remove a node and its edges |
| `removeEdge(source, target)` | `this` | Remove an edge |
| `nodeCount()` | `number` | Number of nodes |
| `edgeCount()` | `number` | Number of edges |
| `hasNode(id)` | `boolean` | Check if node exists |
| `hasEdge(source, target)` | `boolean` | Check if edge exists |
| `neighbors(id)` | `VertexId[]` | Adjacent node IDs |
| `degree(id)` | `number` | Number of adjacent edges |
| `nodes()` | `VertexId[]` | All node IDs |
| `edges()` | `Array<{source, target, data}>` | All edges |
| `nodeData(id)` | `N` | Node's custom data |
| `subgraph(nodeIds)` | `Graph<N, E>` | Extract a subgraph |
| `toJSON()` | `SerializedGraph` | Serialize to JSON |
| `toG6Format(layout?)` | `G6GraphData` | Convert for AntV G6 |
| `toReactFlowFormat(layout?)` | `ReactFlowData` | Convert for React Flow |
| `toCytoscapeFormat(layout?)` | `CytoscapeData` | Convert for Cytoscape.js |

## Types

```typescript
type VertexId = number;

interface GraphOptions {
  directed?: boolean;
}

interface NodeData {
  [key: string]: unknown;
}

interface EdgeData {
  weight?: number;
  [key: string]: unknown;
}

interface CommunityResult {
  membership: number[];
  modularity: number;
  clusters: number;
}

interface CentralityResult {
  scores: number[];
}

interface LayoutResult {
  positions: [number, number][];
}

interface PathResult {
  path: number[];
  distance: number;
}

interface FlowResult {
  value: number;
  flow: number[];
}
```

## Errors

| Error Class | Code | When |
|-------------|------|------|
| `GraphError` | varies | Base class for all errors |
| `NodeNotFoundError` | `NODE_NOT_FOUND` | Node doesn't exist |
| `EdgeNotFoundError` | `EDGE_NOT_FOUND` | Edge doesn't exist |
| `WasmNotInitializedError` | `WASM_NOT_INITIALIZED` | WASM accessed before init |
| `WasmError` | `WASM_ERROR` | WASM runtime error |

## WASM Loader

```typescript
import { getWasm, getWasmSync, isWasmInitialized } from '@graphrs/core';

await getWasm();         // Load WASM (lazy singleton)
getWasmSync();           // Get WASM sync (null if not loaded)
isWasmInitialized();     // Check if WASM is loaded
```
