# @graphrs/core

核心包提供 `Graph` 类、类型定义、错误类和 WASM 加载器。所有其他包都依赖于它。

```bash
npm install @graphrs/core
```

## Graph 类

### 构造函数

```typescript
new Graph<N extends NodeData, E extends EdgeData>(options?: GraphOptions)
```

| 选项       | 类型      | 默认值  | 说明         |
| ---------- | --------- | ------- | ------------ |
| `directed` | `boolean` | `false` | 边是否有方向 |

### 静态工厂方法

#### `Graph.fromEdges(edges, options?)`

```typescript
static fromEdges<N, E>(
  edges: [number, number][],
  options?: GraphOptions,
): Graph<N, E>
```

从 `[source, target]` 对数组创建图。节点自动创建。

#### `Graph.fromAdjacencyMatrix(matrix, options?)`

```typescript
static fromAdjacencyMatrix<N, E>(
  matrix: number[][],
  options?: GraphOptions,
): Graph<N, E>
```

从邻接矩阵创建图。非零值会成为边的权重。

#### `Graph.fromJSON(data)`

```typescript
static fromJSON<N, E>(data: SerializedGraph): Graph<N, E>
```

从序列化的 JSON 对象创建图。

### 实例方法

| 方法                             | 返回值                          | 说明                     |
| -------------------------------- | ------------------------------- | ------------------------ |
| `addNode(id, data?)`             | `this`                          | 添加节点                 |
| `addEdge(source, target, data?)` | `this`                          | 添加边（自动创建节点）   |
| `removeNode(id)`                 | `this`                          | 删除节点及其所有边       |
| `removeEdge(source, target)`     | `this`                          | 删除一条边               |
| `nodeCount()`                    | `number`                        | 节点数量                 |
| `edgeCount()`                    | `number`                        | 边数量                   |
| `hasNode(id)`                    | `boolean`                       | 检查节点是否存在         |
| `hasEdge(source, target)`        | `boolean`                       | 检查边是否存在           |
| `neighbors(id)`                  | `VertexId[]`                    | 相邻节点 ID              |
| `degree(id)`                     | `number`                        | 相邻边的数量             |
| `nodes()`                        | `VertexId[]`                    | 所有节点 ID              |
| `edges()`                        | `Array<{source, target, data}>` | 所有边                   |
| `nodeData(id)`                   | `N`                             | 节点的自定义数据         |
| `subgraph(nodeIds)`              | `Graph<N, E>`                   | 提取子图                 |
| `toJSON()`                       | `SerializedGraph`               | 序列化为 JSON            |
| `toG6Format(layout?)`            | `G6GraphData`                   | 转换为 AntV G6 格式      |
| `toReactFlowFormat(layout?)`     | `ReactFlowData`                 | 转换为 React Flow 格式   |
| `toCytoscapeFormat(layout?)`     | `CytoscapeData`                 | 转换为 Cytoscape.js 格式 |

## 类型

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

## 错误

| 错误类                    | 错误码                 | 触发时机            |
| ------------------------- | ---------------------- | ------------------- |
| `GraphError`              | 不定                   | 所有错误的基类      |
| `NodeNotFoundError`       | `NODE_NOT_FOUND`       | 节点不存在          |
| `EdgeNotFoundError`       | `EDGE_NOT_FOUND`       | 边不存在            |
| `WasmNotInitializedError` | `WASM_NOT_INITIALIZED` | 在初始化前访问 WASM |
| `WasmError`               | `WASM_ERROR`           | WASM 运行时错误     |

## WASM 加载器

```typescript
import { getWasm, getWasmSync, isWasmInitialized } from '@graphrs/core';

await getWasm(); // Load WASM (lazy singleton)
getWasmSync(); // Get WASM sync (null if not loaded)
isWasmInitialized(); // Check if WASM is loaded
```
