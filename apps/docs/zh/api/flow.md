# @graphrs/flow

网络流和连通性算法。

```bash
npm install @graphrs/flow
```

## 函数

### `maxFlow(graph, options?)`

最大流 —— 从源点到汇点找到最大流量。

```typescript
import { maxFlow } from '@graphrs/flow';

const result = await maxFlow(graph, { source: 0, sink: 5 });
```

| 选项     | 类型     | 说明   |
| -------- | -------- | ------ |
| `source` | `number` | 源节点 |
| `sink`   | `number` | 汇节点 |

**返回值**：`Promise<FlowResult>`

```typescript
{
  value: number,   // max flow value
  flow: number[],  // flow on each edge
}
```

### `minCut(graph, options?)`

最小割 —— 找到将源点和汇点断开连接所需的最少边集合。

```typescript
import { minCut } from '@graphrs/flow';

const result = await minCut(graph, { source: 0, sink: 5 });
```

**返回值**：`Promise<MinCutResult>`

### `vertexConnectivity(graph)`

点连通度 —— 使图断开连接所需移除的最少节点数。

```typescript
import { vertexConnectivity } from '@graphrs/flow';

const k = await vertexConnectivity(graph);
```

### `edgeConnectivity(graph)`

边连通度 —— 使图断开连接所需移除的最少边数。

```typescript
import { edgeConnectivity } from '@graphrs/flow';

const k = await edgeConnectivity(graph);
```

### `isConnected(graph)`

检查图是否连通。

```typescript
import { isConnected } from '@graphrs/flow';

const connected = await isConnected(graph);
```
