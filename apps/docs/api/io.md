# @graphrs/io

Import and export graphs in standard file formats.

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

Edge list format: one edge per line, space-separated node IDs.

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

## Summary

| Format | Read | Write | Description |
|--------|------|-------|-------------|
| GraphML | `readGraphML` | `writeGraphML` | XML-based, rich attribute support |
| GML | `readGML` | `writeGML` | Readable text format |
| DOT | `readDOT` | `writeDOT` | Graphviz format |
| Edge List | `readEdgeList` | `writeEdgeList` | Minimal text format |
| Pajek | `readPajek` | `writePajek` | Network analysis format |

All read functions take a string and return `Promise<Graph>`.
All write functions take a `Graph` and return `Promise<string>`.
