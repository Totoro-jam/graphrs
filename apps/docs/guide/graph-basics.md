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
