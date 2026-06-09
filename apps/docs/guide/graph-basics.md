<script setup>
const createAndQuery = `import { Graph } from '@graphrs/core';

// Create an undirected graph
const g = new Graph();
g.addNode(0, { label: 'Alice' });
g.addNode(1, { label: 'Bob' });
g.addNode(2, { label: 'Carol' });
g.addEdge(0, 1, { weight: 2.5 });
g.addEdge(1, 2);
g.addEdge(0, 2);

console.log('Nodes:', g.nodeCount());
console.log('Edges:', g.edgeCount());
console.log('Node 0 data:', JSON.stringify(g.nodeData(0)));
console.log('Neighbors of 1:', g.neighbors(1));
console.log('Degree of 1:', g.degree(1));
console.log('Has edge 0-1:', g.hasEdge(0, 1));
console.log('Has edge 1-0:', g.hasEdge(1, 0), '(undirected)');

// Directed graph
const dg = new Graph({ directed: true });
dg.addEdge(0, 1);
dg.addEdge(1, 2);
console.log('\\nDirected:');
console.log('Has edge 0→1:', dg.hasEdge(0, 1));
console.log('Has edge 1→0:', dg.hasEdge(1, 0));
`;

const factories = `import { Graph } from '@graphrs/core';

// From edge list
const g1 = Graph.fromEdges([[0,1],[1,2],[2,3],[3,0]]);
console.log('fromEdges:', g1.nodeCount(), 'nodes,', g1.edgeCount(), 'edges');

// From adjacency matrix
const matrix = [
  [0, 1, 0, 1],
  [1, 0, 1, 0],
  [0, 1, 0, 1],
  [1, 0, 1, 0],
];
const g2 = Graph.fromAdjacencyMatrix(matrix);
console.log('fromMatrix:', g2.nodeCount(), 'nodes,', g2.edgeCount(), 'edges');

// Weighted adjacency matrix
const weighted = [
  [0, 5, 0],
  [5, 0, 3],
  [0, 3, 0],
];
const g3 = Graph.fromAdjacencyMatrix(weighted);
console.log('Weighted edges:');
g3.edges().forEach(e =>
  console.log('  ' + e.source + '↔' + e.target, JSON.stringify(e.data))
);

// JSON roundtrip
const json = g1.toJSON();
console.log('\\nJSON:', JSON.stringify(json, null, 2));
const restored = Graph.fromJSON(json);
console.log('Restored:', restored.nodeCount(), 'nodes');
`;

const subgraphDemo = `import { Graph } from '@graphrs/core';

const g = Graph.fromEdges([
  [0,1],[1,2],[2,3],[3,4],[4,0],[1,3]
]);
g.addNode(0, { label: 'A' });
g.addNode(1, { label: 'B' });
g.addNode(2, { label: 'C' });
g.addNode(3, { label: 'D' });
g.addNode(4, { label: 'E' });

console.log('Full graph:', g.nodeCount(), 'nodes,', g.edgeCount(), 'edges');

// Extract subgraph
const sub = g.subgraph([0, 1, 2]);
console.log('Subgraph {0,1,2}:', sub.nodeCount(), 'nodes,', sub.edgeCount(), 'edges');
console.log('Subgraph nodes:', sub.nodes());
console.log('Subgraph edges:');
sub.edges().forEach(e => console.log('  ' + e.source + '↔' + e.target));

// Remove operations
g.removeEdge(1, 3);
console.log('\\nAfter removing edge 1-3:', g.edgeCount(), 'edges');
g.removeNode(4);
console.log('After removing node 4:', g.nodeCount(), 'nodes,', g.edgeCount(), 'edges');
`;
</script>

# Graph Basics

The `Graph` class from `@graphrs/core` is the foundation of graphrs. It represents a graph with nodes and edges, and provides methods to create, query, and serialize graph data.

## Creating a Graph

### Empty graph

```typescript
import { Graph } from '@graphrs/core';

// Undirected graph (default)
const g = new Graph();

// Directed graph
const dg = new Graph({ directed: true });
```

### From an edge list

```typescript
const g = Graph.fromEdges([
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
]);
// Creates 4 nodes and 4 edges automatically
```

### From an adjacency matrix

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

### From JSON

```typescript
const g = Graph.fromJSON({
  directed: false,
  nodes: [
    { id: 0, data: { label: 'Alice' } },
    { id: 1, data: { label: 'Bob' } },
  ],
  edges: [
    { source: 0, target: 1, data: { weight: 1.0 } },
  ],
});
```

## Adding Nodes and Edges

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

### Try It — Create & Query

<Playground :code="createAndQuery" />

## Querying the Graph

```typescript
g.nodeCount();          // number of nodes
g.edgeCount();          // number of edges
g.hasNode(0);           // true
g.hasEdge(0, 1);        // true
g.neighbors(0);         // [1] — adjacent node ids
g.degree(0);            // 1 — number of adjacent edges
g.nodes();              // [0, 1, 2, ...] — all node ids
g.edges();              // [{ source, target, data }, ...]
g.nodeData(0);          // { label: 'Alice' }
g.directed;             // false
```

## Removing Nodes and Edges

```typescript
g.removeEdge(0, 1);  // removes a specific edge
g.removeNode(2);     // removes node and all its edges
```

Both throw typed errors (`NodeNotFoundError`, `EdgeNotFoundError`) if the target doesn't exist.

## Extracting Subgraphs

```typescript
const sub = g.subgraph([0, 1, 2]);
// New graph with only nodes 0, 1, 2 and edges between them
```

### Try It — Subgraph & Removal

<Playground :code="subgraphDemo" />

## Serialization

### JSON roundtrip

```typescript
const json = g.toJSON();
const g2 = Graph.fromJSON(json);
```

### Visualization formats

graphrs provides built-in serializers for popular graph visualization libraries:

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

All format methods accept an optional `LayoutResult` to include computed positions:

```typescript
import { layoutFR } from '@graphrs/layout';

const layout = await layoutFR(g);
const g6Data = g.toG6Format(layout);
// nodes now include x, y coordinates
```

See [Integration Examples](/examples/antv-g6) for complete usage with each library.

### Try It — Factories & Serialization

<Playground :code="factories" />

## Type Safety

The `Graph` class supports generic type parameters for node and edge data:

```typescript
interface Person { name: string; age: number }
interface Connection { since: number; weight?: number }

const g = new Graph<Person, Connection>();
g.addNode(0, { name: 'Alice', age: 30 });
g.addEdge(0, 1, { since: 2020, weight: 1.5 });

const data = g.nodeData(0); // typed as Person
```
