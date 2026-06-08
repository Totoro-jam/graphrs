# 图基础

`@graphrs/core` 中的 `Graph` 类是 graphrs 的基础。它表示一个包含节点和边的图，并提供创建、查询和序列化图数据的方法。

## 创建图

### 空图

```typescript
import { Graph } from '@graphrs/core';

// Undirected graph (default)
const g = new Graph();

// Directed graph
const dg = new Graph({ directed: true });
```

### 从边列表创建

```typescript
const g = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
]);
// Creates 4 nodes and 4 edges automatically
```

### 从邻接矩阵创建

```typescript
const matrix = [
  [0, 1, 0, 1],
  [1, 0, 1, 0],
  [0, 1, 0, 1],
  [1, 0, 1, 0],
];
const g = Graph.fromAdjacencyMatrix(matrix);

// Weighted adjacency matrix
const weighted = [
  [0, 5, 0],
  [5, 0, 3],
  [0, 3, 0],
];
const wg = Graph.fromAdjacencyMatrix(weighted);
// Edges will have { weight: 5 } and { weight: 3 }
```

### 从 JSON 创建

```typescript
const g = Graph.fromJSON({
  directed: false,
  nodes: [
    { id: 0, data: { label: 'Alice' } },
    { id: 1, data: { label: 'Bob' } },
  ],
  edges: [{ source: 0, target: 1, data: { weight: 1.0 } }],
});
```

## 添加节点和边

```typescript
const g = new Graph();

// Add nodes (with optional data)
g.addNode(0, { label: 'Alice' });
g.addNode(1, { label: 'Bob' });
g.addNode(2); // data defaults to {}

// Add edges (with optional data)
g.addEdge(0, 1, { weight: 2.5 });
g.addEdge(1, 2); // auto-creates missing nodes

// Chaining
g.addNode(3).addNode(4).addEdge(3, 4);
```

## 查询图

```typescript
g.nodeCount(); // number of nodes
g.edgeCount(); // number of edges
g.hasNode(0); // true
g.hasEdge(0, 1); // true
g.neighbors(0); // [1] — adjacent node ids
g.degree(0); // 1 — number of adjacent edges
g.nodes(); // [0, 1, 2, ...] — all node ids
g.edges(); // [{ source, target, data }, ...]
g.nodeData(0); // { label: 'Alice' }
g.directed; // false
```

## 删除节点和边

```typescript
g.removeEdge(0, 1); // removes a specific edge
g.removeNode(2); // removes node and all its edges
```

如果目标不存在，以上方法会抛出类型化的错误（`NodeNotFoundError`、`EdgeNotFoundError`）。

## 提取子图

```typescript
const sub = g.subgraph([0, 1, 2]);
// New graph with only nodes 0, 1, 2 and edges between them
```

## 序列化

### JSON 往返

```typescript
const json = g.toJSON();
const g2 = Graph.fromJSON(json);
```

### 可视化格式

graphrs 为流行的图可视化库提供了内置的序列化器：

```typescript
// AntV G6
const g6Data = g.toG6Format();
// { nodes: [{ id: "0", ... }], edges: [{ source: "0", target: "1" }] }

// React Flow
const rfData = g.toReactFlowFormat();
// { nodes: [{ id: "0", position: {x,y}, data }], edges: [{ id, source, target }] }

// Cytoscape.js
const cyData = g.toCytoscapeFormat();
// { elements: { nodes: [{ data: { id } }], edges: [{ data: { source, target } }] } }
```

所有格式化方法都接受一个可选的 `LayoutResult` 参数来包含计算后的坐标位置：

```typescript
import { layoutFR } from '@graphrs/layout';

const layout = await layoutFR(g);
const g6Data = g.toG6Format(layout);
// nodes now include x, y coordinates
```

完整用法请参见[集成示例](/zh/examples/antv-g6)。

## 类型安全

`Graph` 类支持泛型类型参数，用于节点和边的数据：

```typescript
interface Person {
  name: string;
  age: number;
}
interface Connection {
  since: number;
  weight?: number;
}

const g = new Graph<Person, Connection>();
g.addNode(0, { name: 'Alice', age: 30 });
g.addEdge(0, 1, { since: 2020, weight: 1.5 });

const data = g.nodeData(0); // typed as Person
```
