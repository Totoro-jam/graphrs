<script setup>
const creation = `import { Graph } from './graphrs-core.js';

const g = new Graph(true);
g.addNode(0, { name: 'Alice' });
g.addNode(1, { name: 'Bob' });
g.addNode(2, { name: 'Carol' });
g.addEdge(0, 1);
g.addEdge(1, 2);
g.addEdge(2, 0);

console.log('有向图:');
console.log('  节点:', g.nodeCount(), '边:', g.edgeCount());
console.log('  节点 0 的邻居:', g.neighbors(0));
console.log('  存在边 0→1:', g.hasEdge(0, 1));
console.log('  存在边 1→0:', g.hasEdge(1, 0));
console.log('  节点 0 数据:', JSON.stringify(g.nodeData(0)));

const g2 = Graph.fromEdges([[0,1],[1,2],[2,3],[3,0]]);
console.log('\\n从边列表:', g2.nodeCount(), '节点,', g2.edgeCount(), '边');

const sub = g2.subgraph([0, 1, 2]);
console.log('子图 {0,1,2}:', sub.nodeCount(), '节点,', sub.edgeCount(), '边');
`;

const roundtrip = `import { Graph } from './graphrs-core.js';

const g = Graph.fromEdges([[0,1],[1,2],[2,0]]);
g.addNode(0, { label: 'A' });
g.addNode(1, { label: 'B' });
g.addNode(2, { label: 'C' });

const json = g.toJSON();
console.log('序列化结果:', JSON.stringify(json, null, 2));

const restored = Graph.fromJSON(json);
console.log('\\n恢复:', restored.nodeCount(), '节点,', restored.edgeCount(), '边');
console.log('节点 0 数据:', JSON.stringify(restored.nodeData(0)));
`;
</script>

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

## 在线体验

### 图创建与查询

<Playground :code="creation" />

### 序列化往返

<Playground :code="roundtrip" />

## 类型

### 图类型

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

### 算法结果类型

```typescript
interface CommunityResult {
  membership: number[];  // 每个节点的社区索引
  modularity: number;    // 模块度分数
  clusters: number;      // 社区数量
}

interface CentralityResult {
  scores: number[];  // 每个节点的中心性分数
}

interface LayoutResult {
  positions: [number, number][];  // 每个节点的 [x, y] 坐标
}

interface Layout3DResult {
  positions: [number, number, number][];  // 每个节点的 [x, y, z] 坐标
}

interface PathResult {
  path: number[];     // 最短路径上的节点 ID
  distance: number;   // 总距离（不可达时为 Infinity）
}

interface FlowResult {
  value: number;   // 最大流总量
  flow: number[];  // 每条边的流量值
}
```

### 可视化格式类型

这些类型描述 `toG6Format()`、`toReactFlowFormat()` 和 `toCytoscapeFormat()` 的输出格式。

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
其他结果类型（`BfsResult`、`DfsResult`、`HitsResult`、`MinCutResult`）从各自的包中导出。请参阅 [path](/zh/api/path)、[centrality](/zh/api/centrality) 和 [flow](/zh/api/flow) API 参考。
:::

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
