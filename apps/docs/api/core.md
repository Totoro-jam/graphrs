<script setup>
const creation = `import { Graph } from './graphrs-core.js';

const g = new Graph(true);
g.addNode(0, { name: 'Alice' });
g.addNode(1, { name: 'Bob' });
g.addNode(2, { name: 'Carol' });
g.addEdge(0, 1);
g.addEdge(1, 2);
g.addEdge(2, 0);

console.log('Directed graph:');
console.log('  Nodes:', g.nodeCount(), 'Edges:', g.edgeCount());
console.log('  Neighbors of 0:', g.neighbors(0));
console.log('  Has edge 0→1:', g.hasEdge(0, 1));
console.log('  Has edge 1→0:', g.hasEdge(1, 0));
console.log('  Node 0 data:', JSON.stringify(g.nodeData(0)));

const g2 = Graph.fromEdges([[0,1],[1,2],[2,3],[3,0]]);
console.log('\\nFrom edges:', g2.nodeCount(), 'nodes,', g2.edgeCount(), 'edges');

const sub = g2.subgraph([0, 1, 2]);
console.log('Subgraph {0,1,2}:', sub.nodeCount(), 'nodes,', sub.edgeCount(), 'edges');
`;

const roundtrip = `import { Graph } from './graphrs-core.js';

const g = Graph.fromEdges([[0,1],[1,2],[2,0]]);
g.addNode(0, { label: 'A' });
g.addNode(1, { label: 'B' });
g.addNode(2, { label: 'C' });

const json = g.toJSON();
console.log('Serialized:', JSON.stringify(json, null, 2));

const restored = Graph.fromJSON(json);
console.log('\\nRestored:', restored.nodeCount(), 'nodes,', restored.edgeCount(), 'edges');
console.log('Node 0 data:', JSON.stringify(restored.nodeData(0)));
`;
</script>

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

## Try It

### Graph Creation & Querying

<Playground :code="creation" />

### Serialization Round-trip

<Playground :code="roundtrip" />

## Types

### Graph Types

```typescript
type VertexId = number;
type EdgeId = number;

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

interface SerializedGraph {
  directed: boolean;
  nodes: Array<{ id: VertexId; data?: Record<string, unknown> }>;
  edges: Array<{ source: VertexId; target: VertexId; data?: Record<string, unknown> }>;
}
```

### Algorithm Result Types

```typescript
interface CommunityResult {
  membership: number[];  // community index per node
  modularity: number;    // modularity score
  clusters: number;      // number of communities
}

interface CentralityResult {
  scores: number[];  // centrality score per node
}

interface LayoutResult {
  positions: [number, number][];  // [x, y] per node
}

interface Layout3DResult {
  positions: [number, number, number][];  // [x, y, z] per node
}

interface PathResult {
  path: number[];     // node IDs along the shortest path
  distance: number;   // total distance (Infinity if unreachable)
}

interface FlowResult {
  value: number;   // total maximum flow value
  flow: number[];  // flow value per edge
}
```

### Visualization Format Types

These types describe the output of `toG6Format()`, `toReactFlowFormat()`, and `toCytoscapeFormat()`.

```typescript
interface G6GraphData {
  nodes: Array<{ id: string; x?: number; y?: number; [key: string]: unknown }>;
  edges: Array<{ source: string; target: string; [key: string]: unknown }>;
}

interface ReactFlowData {
  nodes: Array<{
    id: string;
    position: { x: number; y: number };
    data: Record<string, unknown>;
  }>;
  edges: Array<{ id: string; source: string; target: string }>;
}

interface CytoscapeData {
  elements: {
    nodes: Array<{ data: { id: string; [key: string]: unknown } }>;
    edges: Array<{ data: { source: string; target: string; [key: string]: unknown } }>;
  };
}
```

::: tip
Additional result types (`BfsResult`, `DfsResult`, `HitsResult`, `MinCutResult`) are exported from their respective packages. See the [path](/api/path), [centrality](/api/centrality), and [flow](/api/flow) API references.
:::

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
