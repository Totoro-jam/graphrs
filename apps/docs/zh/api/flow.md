# @graphrs/flow

网络流和连通性算法。解决图上的最大流、最小割和连通性问题。

```bash
npm install @graphrs/flow
```

## 最大流

### `maxFlow(graph, source, target, options?)`

从源节点到目标节点找到最大流。默认使用 Ford-Fulkerson 方法。

```typescript
import { Graph } from '@graphrs/core';
import { maxFlow } from '@graphrs/flow';

// 一个简单的流网络
//   0 → 1 → 3
//   ↓       ↑
//   2 ------→
const graph = Graph.fromEdges(
  [[0, 1], [0, 2], [1, 3], [2, 3]],
  { directed: true },
);

const result = await maxFlow(graph, 0, 3);
console.log(result.value); // 2（两条边不相交的路径）
console.log(result.flow);  // 每条边上的流量
```

**参数：**

| 参数       | 类型             | 说明           |
| ---------- | ---------------- | -------------- |
| `graph`    | `Graph`          | 输入图         |
| `source`   | `number`         | 源节点 ID      |
| `target`   | `number`         | 目标/汇节点 ID |
| `options`  | `MaxFlowOptions` | 可选设置       |

**选项：**

| 选项        | 类型                                     | 默认值             | 说明       |
| ----------- | ---------------------------------------- | ------------------ | ---------- |
| `algorithm` | `'ford-fulkerson' \| 'push-relabel'`     | `'ford-fulkerson'` | 使用的算法 |

**返回值：** `Promise<FlowResult>`

```typescript
interface FlowResult {
  value: number;   // 最大流总值
  flow: number[];  // 每条边上的流量（按边的顺序索引）
}
```

## 最小割

### `minCut(graph, source, target)`

最小割 —— 找到移除后能断开源节点与目标节点连接的最小边集合。根据最大流-最小割定理，最小割的值等于最大流的值。

```typescript
import { Graph } from '@graphrs/core';
import { minCut } from '@graphrs/flow';

const graph = Graph.fromEdges(
  [[0, 1], [0, 2], [1, 3], [2, 3]],
  { directed: true },
);

const result = await minCut(graph, 0, 3);
console.log(result.value);     // 2
console.log(result.partition); // [[0, ...], [3, ...]] — 割的两侧
console.log(result.cutEdges);  // 跨越割的边
```

**参数：**

| 参数     | 类型     | 说明         |
| -------- | -------- | ------------ |
| `graph`  | `Graph`  | 输入图       |
| `source` | `number` | 源节点 ID    |
| `target` | `number` | 目标节点 ID  |

**返回值：** `Promise<MinCutResult>`

```typescript
interface MinCutResult {
  value: number;                   // 最小割值（= 最大流值）
  partition: [number[], number[]]; // 节点的两个分区
  cutEdges: [number, number][];    // 跨越割的边
}
```

## 连通性

### `vertexConnectivity(graph)`

计算点连通度 (κ) —— 使图断开连接所需移除的最少节点数。值越高，图对节点故障的容错能力越强。

```typescript
import { Graph } from '@graphrs/core';
import { vertexConnectivity } from '@graphrs/flow';

const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0], // 三角形
  [2, 3], [3, 4], [4, 2], // 三角形
]);

const k = await vertexConnectivity(graph);
console.log(k); // 图的点连通度
```

**返回值：** `Promise<number>`

### `edgeConnectivity(graph)`

计算边连通度 (λ) —— 使图断开连接所需移除的最少边数。根据 Whitney 定理：κ(G) ≤ λ(G) ≤ δ(G)，其中 δ 是最小度数。

```typescript
import { edgeConnectivity } from '@graphrs/flow';

const k = await edgeConnectivity(graph);
console.log(k); // 边连通度
```

**返回值：** `Promise<number>`

### `isConnected(graph)`

检查图是否（弱）连通 —— 即忽略边的方向后，每对节点之间是否存在路径。

```typescript
import { Graph } from '@graphrs/core';
import { isConnected } from '@graphrs/flow';

const graph = Graph.fromEdges([[0, 1], [2, 3]]); // 两个连通分量
const connected = await isConnected(graph);
console.log(connected); // false
```

**返回值：** `Promise<boolean>`

## 完整示例

结合流和连通性分析网络的健壮性：

```typescript
import { Graph } from '@graphrs/core';
import { maxFlow, minCut, vertexConnectivity, edgeConnectivity, isConnected } from '@graphrs/flow';

const network = Graph.fromEdges(
  [[0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [3, 4]],
  { directed: true },
);

// 检查基本连通性
const connected = await isConnected(network);
console.log('连通:', connected); // true

// 测量健壮性
const vk = await vertexConnectivity(network);
const ek = await edgeConnectivity(network);
console.log(`点连通度: ${vk}`);
console.log(`边连通度: ${ek}`);

// 特定节点间的流分析
const flow = await maxFlow(network, 0, 4);
console.log(`最大流 0→4: ${flow.value}`);

const cut = await minCut(network, 0, 4);
console.log(`最小割边:`, cut.cutEdges);
```

## API 总结

| 函数                 | 签名                                 | 返回值                 | 说明                   |
| -------------------- | ------------------------------------ | ---------------------- | ---------------------- |
| `maxFlow`            | `(graph, source, target, options?)`  | `Promise<FlowResult>`  | 两节点间的最大流       |
| `minCut`             | `(graph, source, target)`            | `Promise<MinCutResult>` | 两节点间的最小割       |
| `vertexConnectivity` | `(graph)`                            | `Promise<number>`      | 使图断开的最少节点数   |
| `edgeConnectivity`   | `(graph)`                            | `Promise<number>`      | 使图断开的最少边数     |
| `isConnected`        | `(graph)`                            | `Promise<boolean>`     | 图是否连通             |
