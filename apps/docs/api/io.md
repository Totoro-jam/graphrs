# @graphrs/io

Import and export graphs in standard file formats. Powered by igraph's battle-tested parsers via WASM.

```bash
npm install @graphrs/io
```

## GraphML

XML-based format with rich attribute support. The standard exchange format for graph tools — supported by Gephi, yEd, Cytoscape, and NetworkX.

```typescript
import { readGraphML, writeGraphML } from '@graphrs/io';

const graph = await readGraphML(xmlString);
const xml = await writeGraphML(graph);
```

### `readGraphML(xml: string): Promise<Graph>`

Parse a GraphML XML string into a `Graph`. Supports directed/undirected graphs, node/edge attributes, and nested `<graph>` elements.

### `writeGraphML(graph: Graph): Promise<string>`

Serialize a `Graph` to GraphML XML string.

**Example format:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphstudio.org/xmlns">
  <graph id="G" edgedefault="undirected">
    <node id="n0"/>
    <node id="n1"/>
    <node id="n2"/>
    <edge source="n0" target="n1"/>
    <edge source="n1" target="n2"/>
  </graph>
</graphml>
```

## GML

Graph Modelling Language — a human-readable hierarchical format. Used by igraph, NetworkX, and LEDA.

```typescript
import { readGML, writeGML } from '@graphrs/io';

const graph = await readGML(gmlString);
const gml = await writeGML(graph);
```

### `readGML(text: string): Promise<Graph>`

Parse a GML string into a `Graph`.

### `writeGML(graph: Graph): Promise<string>`

Serialize a `Graph` to GML format.

**Example format:**

```
graph [
  directed 0
  node [ id 0 ]
  node [ id 1 ]
  node [ id 2 ]
  edge [ source 0 target 1 ]
  edge [ source 1 target 2 ]
]
```

## DOT (Graphviz)

The [Graphviz](https://graphviz.org/) DOT language. Widely used for graph visualization, supported by dozens of tools.

```typescript
import { readDOT, writeDOT } from '@graphrs/io';

const graph = await readDOT(dotString);
const dot = await writeDOT(graph);
```

### `readDOT(text: string): Promise<Graph>`

Parse a DOT format string into a `Graph`. Supports both `graph` (undirected) and `digraph` (directed).

### `writeDOT(graph: Graph): Promise<string>`

Serialize a `Graph` to DOT format.

**Example format:**

```plaintext
graph {
  0 -- 1;
  1 -- 2;
  2 -- 0;
}
```

```plaintext
digraph {
  0 -> 1;
  1 -> 2;
}
```

## Edge List

Minimal plain-text format — one edge per line, space-separated node IDs. The simplest way to represent a graph in a text file.

```typescript
import { readEdgeList, writeEdgeList } from '@graphrs/io';

const graph = await readEdgeList(text);
const edgeList = await writeEdgeList(graph);
```

### `readEdgeList(text: string): Promise<Graph>`

Parse an edge list string. Each line defines one edge with two space-separated node IDs.

### `writeEdgeList(graph: Graph): Promise<string>`

Serialize a `Graph` to edge list format.

**Example format:**

```
0 1
1 2
2 3
3 0
```

## Pajek

[Pajek](http://mrvar.fdv.uni-lj.si/pajek/) format — popular in social network analysis. Supports both vertices and edges sections.

```typescript
import { readPajek, writePajek } from '@graphrs/io';

const graph = await readPajek(pajekString);
const pajek = await writePajek(graph);
```

### `readPajek(text: string): Promise<Graph>`

Parse a Pajek `.net` file string into a `Graph`.

### `writePajek(graph: Graph): Promise<string>`

Serialize a `Graph` to Pajek format.

**Example format:**

```
*Vertices 4
1 "Node 1"
2 "Node 2"
3 "Node 3"
4 "Node 4"
*Edges
1 2
2 3
3 4
```

## Roundtrip Example

Read a graph from one format, analyze it, then export to another:

```typescript
import { Graph } from '@graphrs/core';
import { readGraphML, writeDOT } from '@graphrs/io';
import { louvain } from '@graphrs/community';

// Read from GraphML
const graph = await readGraphML(xmlData);

// Analyze
const communities = await louvain(graph);
console.log(`Found ${communities.clusters} communities`);

// Export to DOT for Graphviz visualization
const dot = await writeDOT(graph);
```

## Choosing a Format

| Format | Best For | Attributes | Human-Readable | Ecosystem |
|--------|----------|:----------:|:--------------:|-----------|
| GraphML | Interop with desktop tools | Yes | Verbose (XML) | Gephi, yEd, Cytoscape |
| GML | igraph/NetworkX exchange | Yes | Yes | igraph, NetworkX, LEDA |
| DOT | Visualization with Graphviz | Yes | Yes | Graphviz, d3-graphviz |
| Edge List | Quick prototyping, data pipelines | No | Minimal | Universal |
| Pajek | Social network analysis | Limited | Yes | Pajek, UCINet |

## API Summary

| Function | Input | Output | Description |
|----------|-------|--------|-------------|
| `readGraphML` | `string` | `Promise<Graph>` | Parse GraphML XML |
| `writeGraphML` | `Graph` | `Promise<string>` | Serialize to GraphML |
| `readGML` | `string` | `Promise<Graph>` | Parse GML |
| `writeGML` | `Graph` | `Promise<string>` | Serialize to GML |
| `readDOT` | `string` | `Promise<Graph>` | Parse DOT/Graphviz |
| `writeDOT` | `Graph` | `Promise<string>` | Serialize to DOT |
| `readEdgeList` | `string` | `Promise<Graph>` | Parse edge list |
| `writeEdgeList` | `Graph` | `Promise<string>` | Serialize to edge list |
| `readPajek` | `string` | `Promise<Graph>` | Parse Pajek .net |
| `writePajek` | `Graph` | `Promise<string>` | Serialize to Pajek |
