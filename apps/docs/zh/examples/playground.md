<script setup>
const graphBasics = `import { Graph } from '@graphrs/core';

// 创建有向图
const graph = new Graph(true);

// 添加带数据的节点
graph.addNode(0, { label: 'Alice' });
graph.addNode(1, { label: 'Bob' });
graph.addNode(2, { label: 'Carol' });
graph.addNode(3, { label: 'Dave' });

// 添加边（有向）
graph.addEdge(0, 1);  // Alice → Bob
graph.addEdge(0, 2);  // Alice → Carol
graph.addEdge(1, 2);  // Bob → Carol
graph.addEdge(2, 3);  // Carol → Dave
graph.addEdge(3, 0);  // Dave → Alice

console.log('节点数:', graph.nodeCount());
console.log('边数:', graph.edgeCount());
console.log('是否有向:', graph.isDirected);
console.log('Alice 的邻居:', graph.neighbors(0));
console.log('Carol 的度:', graph.degree(2));
console.log('存在边 0→1:', graph.hasEdge(0, 1));
console.log('存在边 1→0:', graph.hasEdge(1, 0));
`;

const fromEdges = `import { Graph } from '@graphrs/core';

// 从边列表创建无向图
const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 3],
  [3, 4], [4, 0], [0, 2],
]);

console.log('节点数:', graph.nodeCount());
console.log('边数:', graph.edgeCount());
console.log('所有节点:', graph.nodes());
console.log('所有边:');
graph.edges().forEach(e => {
  console.log('  ' + e.source + ' — ' + e.target);
});

// 子图提取
const sub = graph.subgraph([0, 1, 2]);
console.log('\\n子图 {0,1,2}:');
console.log('  节点:', sub.nodeCount(), '边:', sub.edgeCount());
`;

const adjMatrix = `import { Graph } from '@graphrs/core';

// 从邻接矩阵构建
const matrix = [
  [0, 1, 0, 0],
  [1, 0, 2, 0],
  [0, 2, 0, 3],
  [0, 0, 3, 0],
];

const graph = Graph.fromAdjacencyMatrix(matrix);

console.log('从邻接矩阵构建的图:');
console.log('  节点:', graph.nodeCount());
console.log('  边:', graph.edgeCount());

// 序列化为 JSON
const json = graph.toJSON();
console.log('\\nJSON 输出:');
console.log(JSON.stringify(json, null, 2));

// 往返: JSON → Graph
const restored = Graph.fromJSON(json);
console.log('\\n恢复的图:', restored.nodeCount(), '节点,', restored.edgeCount(), '边');
`;

const serialization = `import { Graph } from '@graphrs/core';

const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0], [2, 3],
]);
graph.addNode(0, { label: 'A' });
graph.addNode(1, { label: 'B' });
graph.addNode(2, { label: 'C' });
graph.addNode(3, { label: 'D' });

// G6 格式
console.log('=== G6 格式 ===');
console.log(JSON.stringify(graph.toG6Format(), null, 2));

// React Flow 格式
console.log('\\n=== React Flow 格式 ===');
console.log(JSON.stringify(graph.toReactFlowFormat(), null, 2));

// Cytoscape 格式
console.log('\\n=== Cytoscape 格式 ===');
console.log(JSON.stringify(graph.toCytoscapeFormat(), null, 2));
`;
</script>

# 代码示例

编辑代码即时查看结果 — 每个示例都在真实的沙箱中运行。

## 图基础操作

创建图、添加节点和边，查看图的属性：

<Playground :code="graphBasics" />

## 从边列表构建

快速从边列表构建图：

<Playground :code="fromEdges" />

## 邻接矩阵

从邻接矩阵构建图并转换为 JSON：

<Playground :code="adjMatrix" />

## 序列化格式

导出为不同可视化库的格式：

<Playground :code="serialization" />
