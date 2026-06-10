<script setup>
const createAndQuery = `import { Graph } from './graphrs-core.js';

// 创建无向图
const g = new Graph();
g.addNode(0, { label: 'Alice' });
g.addNode(1, { label: 'Bob' });
g.addNode(2, { label: 'Carol' });
g.addEdge(0, 1, { weight: 2.5 });
g.addEdge(1, 2);
g.addEdge(0, 2);

console.log('节点数:', g.nodeCount());
console.log('边数:', g.edgeCount());
console.log('节点 0 数据:', JSON.stringify(g.nodeData(0)));
console.log('节点 1 的邻居:', g.neighbors(1));
console.log('节点 1 的度:', g.degree(1));
console.log('存在边 0-1:', g.hasEdge(0, 1));
console.log('存在边 1-0:', g.hasEdge(1, 0), '(无向图)');

// 有向图
const dg = new Graph({ directed: true });
dg.addEdge(0, 1);
dg.addEdge(1, 2);
console.log('\\n有向图:');
console.log('存在边 0→1:', dg.hasEdge(0, 1));
console.log('存在边 1→0:', dg.hasEdge(1, 0));
`;

const factories = `import { Graph } from './graphrs-core.js';

// 从边列表创建
const g1 = Graph.fromEdges([[0,1],[1,2],[2,3],[3,0]]);
console.log('fromEdges:', g1.nodeCount(), '节点,', g1.edgeCount(), '边');

// 从邻接矩阵创建
const matrix = [
  [0, 1, 0, 1],
  [1, 0, 1, 0],
  [0, 1, 0, 1],
  [1, 0, 1, 0],
];
const g2 = Graph.fromAdjacencyMatrix(matrix);
console.log('fromMatrix:', g2.nodeCount(), '节点,', g2.edgeCount(), '边');

// 带权邻接矩阵
const weighted = [
  [0, 5, 0],
  [5, 0, 3],
  [0, 3, 0],
];
const g3 = Graph.fromAdjacencyMatrix(weighted);
console.log('带权边:');
g3.edges().forEach(e =>
  console.log('  ' + e.source + '↔' + e.target, JSON.stringify(e.data))
);

// JSON 往返
const json = g1.toJSON();
console.log('\\nJSON:', JSON.stringify(json, null, 2));
const restored = Graph.fromJSON(json);
console.log('恢复:', restored.nodeCount(), '节点');
`;

const subgraphDemo = `import { Graph } from './graphrs-core.js';

const g = Graph.fromEdges([
  [0,1],[1,2],[2,3],[3,4],[4,0],[1,3]
]);
g.addNode(0, { label: 'A' });
g.addNode(1, { label: 'B' });
g.addNode(2, { label: 'C' });
g.addNode(3, { label: 'D' });
g.addNode(4, { label: 'E' });

console.log('完整图:', g.nodeCount(), '节点,', g.edgeCount(), '边');

// 提取子图
const sub = g.subgraph([0, 1, 2]);
console.log('子图 {0,1,2}:', sub.nodeCount(), '节点,', sub.edgeCount(), '边');
console.log('子图节点:', sub.nodes());
console.log('子图边:');
sub.edges().forEach(e => console.log('  ' + e.source + '↔' + e.target));

// 删除操作
g.removeEdge(1, 3);
console.log('\\n删除边 1-3 后:', g.edgeCount(), '边');
g.removeNode(4);
console.log('删除节点 4 后:', g.nodeCount(), '节点,', g.edgeCount(), '边');
`;
</script>

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
// 自动创建 4 个节点和 4 条边
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

// 带权邻接矩阵
const weighted = [
  [0, 5, 0],
  [5, 0, 3],
  [0, 3, 0],
];
const wg = Graph.fromAdjacencyMatrix(weighted);
// 边将带有 { weight: 5 } 和 { weight: 3 }
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

// 添加节点（可选数据）
g.addNode(0, { label: 'Alice' });
g.addNode(1, { label: 'Bob' });
g.addNode(2); // 数据默认为 {}

// 添加边（可选数据）
g.addEdge(0, 1, { weight: 2.5 });
g.addEdge(1, 2); // 自动创建缺失的节点

// 链式调用
g.addNode(3).addNode(4).addEdge(3, 4);
```

### 在线体验 — 创建与查询

<Playground :code="createAndQuery" />

## 查询图

```typescript
g.nodeCount(); // 节点数量
g.edgeCount(); // 边数量
g.hasNode(0); // true
g.hasEdge(0, 1); // true
g.neighbors(0); // [1] — 相邻节点 ID
g.degree(0); // 1 — 相邻边的数量
g.nodes(); // [0, 1, 2, ...] — 所有节点 ID
g.edges(); // [{ source, target, data }, ...]
g.nodeData(0); // { label: 'Alice' }
g.directed; // false
```

## 删除节点和边

```typescript
g.removeEdge(0, 1); // 删除指定的边
g.removeNode(2); // 删除节点及其所有边
```

如果目标不存在，以上方法会抛出类型化的错误（`NodeNotFoundError`、`EdgeNotFoundError`）。

## 提取子图

```typescript
const sub = g.subgraph([0, 1, 2]);
// 只包含节点 0, 1, 2 及其之间边的新图
```

### 在线体验 — 子图与删除

<Playground :code="subgraphDemo" />

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

### 在线体验 — 工厂方法与序列化

<Playground :code="factories" />

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
