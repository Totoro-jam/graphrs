# @graphrs/io

以标准文件格式导入和导出图。由 igraph 经过充分验证的解析器通过 WASM 驱动。

```bash
npm install @graphrs/io
```

## GraphML

基于 XML 的格式，支持丰富的属性。图工具的标准交换格式 —— Gephi、yEd、Cytoscape 和 NetworkX 均支持。

```typescript
import { readGraphML, writeGraphML } from '@graphrs/io';

const graph = await readGraphML(xmlString);
const xml = await writeGraphML(graph);
```

### `readGraphML(xml: string): Promise<Graph>`

将 GraphML XML 字符串解析为 `Graph`。支持有向/无向图、节点/边属性和嵌套 `<graph>` 元素。

### `writeGraphML(graph: Graph): Promise<string>`

将 `Graph` 序列化为 GraphML XML 字符串。

**格式示例：**

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

图建模语言 —— 一种人类可读的层次化格式。被 igraph、NetworkX 和 LEDA 使用。

```typescript
import { readGML, writeGML } from '@graphrs/io';

const graph = await readGML(gmlString);
const gml = await writeGML(graph);
```

### `readGML(text: string): Promise<Graph>`

将 GML 字符串解析为 `Graph`。

### `writeGML(graph: Graph): Promise<string>`

将 `Graph` 序列化为 GML 格式。

**格式示例：**

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

[Graphviz](https://graphviz.org/) DOT 语言。广泛用于图可视化，被数十种工具支持。

```typescript
import { readDOT, writeDOT } from '@graphrs/io';

const graph = await readDOT(dotString);
const dot = await writeDOT(graph);
```

### `readDOT(text: string): Promise<Graph>`

将 DOT 格式字符串解析为 `Graph`。支持 `graph`（无向）和 `digraph`（有向）。

### `writeDOT(graph: Graph): Promise<string>`

将 `Graph` 序列化为 DOT 格式。

**格式示例：**

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

极简纯文本格式 —— 每行一条边，节点 ID 以空格分隔。最简单的图文本表示方式。

```typescript
import { readEdgeList, writeEdgeList } from '@graphrs/io';

const graph = await readEdgeList(text);
const edgeList = await writeEdgeList(graph);
```

### `readEdgeList(text: string): Promise<Graph>`

解析边列表字符串。每行定义一条边，包含两个空格分隔的节点 ID。

### `writeEdgeList(graph: Graph): Promise<string>`

将 `Graph` 序列化为边列表格式。

**格式示例：**

```
0 1
1 2
2 3
3 0
```

## Pajek

[Pajek](http://mrvar.fdv.uni-lj.si/pajek/) 格式 —— 在社会网络分析中广泛使用。支持顶点和边两个部分。

```typescript
import { readPajek, writePajek } from '@graphrs/io';

const graph = await readPajek(pajekString);
const pajek = await writePajek(graph);
```

### `readPajek(text: string): Promise<Graph>`

将 Pajek `.net` 文件字符串解析为 `Graph`。

### `writePajek(graph: Graph): Promise<string>`

将 `Graph` 序列化为 Pajek 格式。

**格式示例：**

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

## 往返转换示例

从一种格式读取图，分析后导出为另一种格式：

```typescript
import { Graph } from '@graphrs/core';
import { readGraphML, writeDOT } from '@graphrs/io';
import { louvain } from '@graphrs/community';

// 从 GraphML 读取
const graph = await readGraphML(xmlData);

// 分析
const communities = await louvain(graph);
console.log(`发现 ${communities.clusters} 个社区`);

// 导出为 DOT 用于 Graphviz 可视化
const dot = await writeDOT(graph);
```

## 如何选择格式

| 格式      | 最适合场景              | 属性支持 | 人类可读 | 生态系统                |
| --------- | ----------------------- | :------: | :------: | ----------------------- |
| GraphML   | 与桌面工具互操作        |    是    | 冗长(XML) | Gephi, yEd, Cytoscape  |
| GML       | igraph/NetworkX 交换    |    是    |    是    | igraph, NetworkX, LEDA  |
| DOT       | Graphviz 可视化         |    是    |    是    | Graphviz, d3-graphviz   |
| Edge List | 快速原型、数据管道      |    否    |   极简   | 通用                    |
| Pajek     | 社会网络分析            |  有限    |    是    | Pajek, UCINet           |

## API 总结

| 函数             | 输入       | 输出              | 说明            |
| ---------------- | ---------- | ----------------- | --------------- |
| `readGraphML`    | `string`   | `Promise<Graph>`  | 解析 GraphML XML |
| `writeGraphML`   | `Graph`    | `Promise<string>` | 序列化为 GraphML |
| `readGML`        | `string`   | `Promise<Graph>`  | 解析 GML        |
| `writeGML`       | `Graph`    | `Promise<string>` | 序列化为 GML    |
| `readDOT`        | `string`   | `Promise<Graph>`  | 解析 DOT/Graphviz |
| `writeDOT`       | `Graph`    | `Promise<string>` | 序列化为 DOT    |
| `readEdgeList`   | `string`   | `Promise<Graph>`  | 解析边列表      |
| `writeEdgeList`  | `Graph`    | `Promise<string>` | 序列化为边列表  |
| `readPajek`      | `string`   | `Promise<Graph>`  | 解析 Pajek .net |
| `writePajek`     | `Graph`    | `Promise<string>` | 序列化为 Pajek  |
