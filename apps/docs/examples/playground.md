# Interactive Playground

Try graphrs in your browser — edit the code below and see results instantly.

## Graph Basics

Create a graph, add nodes and edges, and inspect its properties:

::: sandbox

```ts /src/index.ts
import { Graph } from '@graphrs/core';

// Create a directed graph
const graph = new Graph(true);

// Add nodes with data
graph.addNode(0, { label: 'Alice' });
graph.addNode(1, { label: 'Bob' });
graph.addNode(2, { label: 'Carol' });
graph.addNode(3, { label: 'Dave' });

// Add edges (directed)
graph.addEdge(0, 1);  // Alice → Bob
graph.addEdge(0, 2);  // Alice → Carol
graph.addEdge(1, 2);  // Bob → Carol
graph.addEdge(2, 3);  // Carol → Dave
graph.addEdge(3, 0);  // Dave → Alice (cycle)

console.log(`Nodes: ${graph.nodeCount()}`);
console.log(`Edges: ${graph.edgeCount()}`);
console.log(`Is directed: ${graph.isDirected}`);
console.log(`Neighbors of Alice: ${graph.neighbors(0)}`);
console.log(`Degree of Carol: ${graph.degree(2)}`);
console.log(`Has edge 0→1: ${graph.hasEdge(0, 1)}`);
console.log(`Has edge 1→0: ${graph.hasEdge(1, 0)}`);
```

```json /package.json
{
  "dependencies": {
    "@graphrs/core": "^0.2.0"
  }
}
```

:::

## Build from Edge List

Quickly construct graphs from an edge list:

::: sandbox

```ts /src/index.ts
import { Graph } from '@graphrs/core';

// Create undirected graph from edges
const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 3],
  [3, 4], [4, 0], [0, 2],
]);

console.log(`Nodes: ${graph.nodeCount()}`);
console.log(`Edges: ${graph.edgeCount()}`);
console.log(`All nodes: ${graph.nodes()}`);
console.log(`All edges:`);
graph.edges().forEach(e => {
  console.log(`  ${e.source} — ${e.target}`);
});

// Subgraph extraction
const sub = graph.subgraph([0, 1, 2]);
console.log(`\nSubgraph {0,1,2}:`);
console.log(`  Nodes: ${sub.nodeCount()}, Edges: ${sub.edgeCount()}`);
```

```json /package.json
{
  "dependencies": {
    "@graphrs/core": "^0.2.0"
  }
}
```

:::

## Adjacency Matrix

Build graphs from adjacency matrices and convert to JSON:

::: sandbox

```ts /src/index.ts
import { Graph } from '@graphrs/core';

// Build from adjacency matrix (weighted)
const matrix = [
  [0, 1, 0, 0],
  [1, 0, 2, 0],
  [0, 2, 0, 3],
  [0, 0, 3, 0],
];

const graph = Graph.fromAdjacencyMatrix(matrix, { weighted: true });

console.log('Graph from adjacency matrix:');
console.log(`  Nodes: ${graph.nodeCount()}`);
console.log(`  Edges: ${graph.edgeCount()}`);

// Serialize to JSON
const json = graph.toJSON();
console.log('\nJSON output:');
console.log(JSON.stringify(json, null, 2));

// Round-trip: JSON → Graph
const restored = Graph.fromJSON(json);
console.log(`\nRestored graph: ${restored.nodeCount()} nodes, ${restored.edgeCount()} edges`);
```

```json /package.json
{
  "dependencies": {
    "@graphrs/core": "^0.2.0"
  }
}
```

:::

## Serialization Formats

Export to different visualization library formats:

::: sandbox

```ts /src/index.ts
import { Graph } from '@graphrs/core';

const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0], [2, 3],
]);

// Add some node data
graph.addNode(0, { label: 'A' });
graph.addNode(1, { label: 'B' });
graph.addNode(2, { label: 'C' });
graph.addNode(3, { label: 'D' });

// G6 format
console.log('=== G6 Format ===');
const g6 = graph.toG6Format();
console.log(JSON.stringify(g6, null, 2));

// React Flow format
console.log('\n=== React Flow Format ===');
const rf = graph.toReactFlowFormat();
console.log(JSON.stringify(rf, null, 2));

// Cytoscape format
console.log('\n=== Cytoscape Format ===');
const cy = graph.toCytoscapeFormat();
console.log(JSON.stringify(cy, null, 2));
```

```json /package.json
{
  "dependencies": {
    "@graphrs/core": "^0.2.0"
  }
}
```

:::
