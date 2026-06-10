# @graphrs/flow

Network flow and connectivity algorithms. Solve maximum flow, minimum cut, and connectivity problems on graphs.

```bash
npm install @graphrs/flow
```

## Maximum Flow

### `maxFlow(graph, source, target, options?)`

Find the maximum flow from a source node to a target node. Uses the Ford-Fulkerson method by default.

```typescript
import { Graph } from '@graphrs/core';
import { maxFlow } from '@graphrs/flow';

// A simple flow network
//   0 → 1 → 3
//   ↓       ↑
//   2 ------→
const graph = Graph.fromEdges(
  [[0, 1], [0, 2], [1, 3], [2, 3]],
  { directed: true },
);

const result = await maxFlow(graph, 0, 3);
console.log(result.value); // 2 (two edge-disjoint paths)
console.log(result.flow);  // flow value on each edge
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `graph` | `Graph` | Input graph |
| `source` | `number` | Source node ID |
| `target` | `number` | Target/sink node ID |
| `options` | `MaxFlowOptions` | Optional settings |

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `algorithm` | `'ford-fulkerson' \| 'push-relabel'` | `'ford-fulkerson'` | Algorithm to use |

**Returns:** `Promise<FlowResult>`

```typescript
interface FlowResult {
  value: number;   // total maximum flow value
  flow: number[];  // flow value on each edge (indexed by edge order)
}
```

## Minimum Cut

### `minCut(graph, source, target)`

Find the minimum cut — the smallest set of edges whose removal disconnects the source from the target. By the max-flow min-cut theorem, the min-cut value equals the max-flow value.

```typescript
import { Graph } from '@graphrs/core';
import { minCut } from '@graphrs/flow';

const graph = Graph.fromEdges(
  [[0, 1], [0, 2], [1, 3], [2, 3]],
  { directed: true },
);

const result = await minCut(graph, 0, 3);
console.log(result.value);     // 2
console.log(result.partition); // [[0, ...], [3, ...]] — two sides of the cut
console.log(result.cutEdges);  // edges crossing the cut
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `graph` | `Graph` | Input graph |
| `source` | `number` | Source node ID |
| `target` | `number` | Target node ID |

**Returns:** `Promise<MinCutResult>`

```typescript
interface MinCutResult {
  value: number;                // min-cut value (= max-flow value)
  partition: [number[], number[]]; // the two partitions of nodes
  cutEdges: [number, number][];    // edges crossing the cut
}
```

## Connectivity

### `vertexConnectivity(graph)`

Compute the vertex connectivity (κ) — the minimum number of nodes whose removal disconnects the graph. A higher value means the graph is more resilient to node failures.

```typescript
import { Graph } from '@graphrs/core';
import { vertexConnectivity } from '@graphrs/flow';

const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0], // triangle
  [2, 3], [3, 4], [4, 2], // triangle
]);

const k = await vertexConnectivity(graph);
console.log(k); // vertex connectivity of the graph
```

**Returns:** `Promise<number>`

### `edgeConnectivity(graph)`

Compute the edge connectivity (λ) — the minimum number of edges whose removal disconnects the graph. By Whitney's theorem: κ(G) ≤ λ(G) ≤ δ(G), where δ is the minimum degree.

```typescript
import { edgeConnectivity } from '@graphrs/flow';

const k = await edgeConnectivity(graph);
console.log(k); // edge connectivity
```

**Returns:** `Promise<number>`

### `isConnected(graph)`

Check whether the graph is (weakly) connected — i.e., there exists a path between every pair of nodes when ignoring edge direction.

```typescript
import { Graph } from '@graphrs/core';
import { isConnected } from '@graphrs/flow';

const graph = Graph.fromEdges([[0, 1], [2, 3]]); // two components
const connected = await isConnected(graph);
console.log(connected); // false
```

**Returns:** `Promise<boolean>`

## Complete Example

Analyze a network's resilience by combining flow and connectivity:

```typescript
import { Graph } from '@graphrs/core';
import { maxFlow, minCut, vertexConnectivity, edgeConnectivity, isConnected } from '@graphrs/flow';

const network = Graph.fromEdges(
  [[0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [3, 4]],
  { directed: true },
);

// Check basic connectivity
const connected = await isConnected(network);
console.log('Connected:', connected); // true

// Measure resilience
const vk = await vertexConnectivity(network);
const ek = await edgeConnectivity(network);
console.log(`Vertex connectivity: ${vk}`);
console.log(`Edge connectivity: ${ek}`);

// Flow analysis between specific nodes
const flow = await maxFlow(network, 0, 4);
console.log(`Max flow 0→4: ${flow.value}`);

const cut = await minCut(network, 0, 4);
console.log(`Min cut edges:`, cut.cutEdges);
```

## API Summary

| Function | Signature | Returns | Description |
|----------|-----------|---------|-------------|
| `maxFlow` | `(graph, source, target, options?)` | `Promise<FlowResult>` | Maximum flow between two nodes |
| `minCut` | `(graph, source, target)` | `Promise<MinCutResult>` | Minimum cut between two nodes |
| `vertexConnectivity` | `(graph)` | `Promise<number>` | Min nodes to disconnect graph |
| `edgeConnectivity` | `(graph)` | `Promise<number>` | Min edges to disconnect graph |
| `isConnected` | `(graph)` | `Promise<boolean>` | Whether graph is connected |
