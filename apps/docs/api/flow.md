# @graphrs/flow

Network flow and connectivity algorithms.

```bash
npm install @graphrs/flow
```

## Functions

### `maxFlow(graph, options?)`

Maximum flow — finds the maximum flow from source to sink.

```typescript
import { maxFlow } from '@graphrs/flow';

const result = await maxFlow(graph, { source: 0, sink: 5 });
```

| Option | Type | Description |
|--------|------|-------------|
| `source` | `number` | Source node |
| `sink` | `number` | Sink node |

**Returns**: `Promise<FlowResult>`

```typescript
{
  value: number,   // max flow value
  flow: number[],  // flow on each edge
}
```

### `minCut(graph, options?)`

Minimum cut — finds the minimum set of edges to disconnect source from sink.

```typescript
import { minCut } from '@graphrs/flow';

const result = await minCut(graph, { source: 0, sink: 5 });
```

**Returns**: `Promise<MinCutResult>`

### `vertexConnectivity(graph)`

Vertex connectivity — minimum number of nodes whose removal disconnects the graph.

```typescript
import { vertexConnectivity } from '@graphrs/flow';

const k = await vertexConnectivity(graph);
```

### `edgeConnectivity(graph)`

Edge connectivity — minimum number of edges whose removal disconnects the graph.

```typescript
import { edgeConnectivity } from '@graphrs/flow';

const k = await edgeConnectivity(graph);
```

### `isConnected(graph)`

Check whether the graph is connected.

```typescript
import { isConnected } from '@graphrs/flow';

const connected = await isConnected(graph);
```
