# @graphrs/operators

图变换和集合运算。

```bash
npm install @graphrs/operators
```

## 集合运算

### `union(g1, g2)`

图的并集 —— 合并两个图的节点和边。

```typescript
import { union } from '@graphrs/operators';

const result = await union(graph1, graph2);
```

### `intersection(g1, g2)`

图的交集 —— 只保留共有的边。

```typescript
import { intersection } from '@graphrs/operators';

const result = await intersection(graph1, graph2);
```

### `difference(g1, g2)`

图的差集 —— g1 中有但 g2 中没有的边。

```typescript
import { difference } from '@graphrs/operators';

const result = await difference(graph1, graph2);
```

## 变换

### `simplify(graph)`

移除自环和多重边。

```typescript
import { simplify } from '@graphrs/operators';

const result = await simplify(graph);
```

### `reverse(graph)`

反转所有边的方向（有向图）。

```typescript
import { reverse } from '@graphrs/operators';

const result = await reverse(directedGraph);
```

### `toDirected(graph)`

将无向图转换为有向图（每条边变为两条有向边）。

```typescript
import { toDirected } from '@graphrs/operators';

const directed = await toDirected(undirectedGraph);
```

### `toUndirected(graph)`

将有向图转换为无向图。

```typescript
import { toUndirected } from '@graphrs/operators';

const undirected = await toUndirected(directedGraph);
```

## 子图运算

### `inducedSubgraph(graph, nodeIds)`

提取给定节点 ID 的导出子图。

```typescript
import { inducedSubgraph } from '@graphrs/operators';

const sub = await inducedSubgraph(graph, [0, 1, 2]);
```

### `complement(graph)`

图的补图 —— 有边变无边，无边变有边。

```typescript
import { complement } from '@graphrs/operators';

const result = await complement(graph);
```

## 返回类型

所有函数返回 `Promise<Graph>`。
