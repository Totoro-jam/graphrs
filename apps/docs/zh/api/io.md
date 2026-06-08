# @graphrs/io

以标准文件格式导入和导出图。

```bash
npm install @graphrs/io
```

## GraphML

```typescript
import { readGraphML, writeGraphML } from '@graphrs/io';

const graph = await readGraphML(xmlString);
const xml = await writeGraphML(graph);
```

## GML

```typescript
import { readGML, writeGML } from '@graphrs/io';

const graph = await readGML(gmlString);
const gml = await writeGML(graph);
```

## DOT (Graphviz)

```typescript
import { readDOT, writeDOT } from '@graphrs/io';

const graph = await readDOT(dotString);
const dot = await writeDOT(graph);
```

## Edge List

```typescript
import { readEdgeList, writeEdgeList } from '@graphrs/io';

const graph = await readEdgeList(edgeListString);
const edgeList = await writeEdgeList(graph);
```

边列表格式：每行一条边，节点 ID 以空格分隔。

```
0 1
1 2
2 3
```

## Pajek

```typescript
import { readPajek, writePajek } from '@graphrs/io';

const graph = await readPajek(pajekString);
const pajek = await writePajek(graph);
```

## 格式总结

| 格式      | 读取           | 写入            | 说明                   |
| --------- | -------------- | --------------- | ---------------------- |
| GraphML   | `readGraphML`  | `writeGraphML`  | 基于 XML，支持丰富属性 |
| GML       | `readGML`      | `writeGML`      | 可读文本格式           |
| DOT       | `readDOT`      | `writeDOT`      | Graphviz 格式          |
| Edge List | `readEdgeList` | `writeEdgeList` | 极简文本格式           |
| Pajek     | `readPajek`    | `writePajek`    | 网络分析格式           |

所有读取函数接受字符串并返回 `Promise<Graph>`。
所有写入函数接受 `Graph` 并返回 `Promise<string>`。
