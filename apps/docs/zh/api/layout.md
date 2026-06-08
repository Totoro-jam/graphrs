# @graphrs/layout

图布局算法，用于计算节点位置。

```bash
npm install @graphrs/layout
```

## 力导向布局

### `layoutFR(graph, options?)`

Fruchterman-Reingold 力导向布局。

```typescript
import { layoutFR } from '@graphrs/layout';

const result = await layoutFR(graph, { iterations: 500 });
```

| 选项         | 类型     | 默认值 | 说明     |
| ------------ | -------- | ------ | -------- |
| `iterations` | `number` | `500`  | 迭代次数 |

### `layoutKK(graph, options?)`

Kamada-Kawai 弹簧布局 —— 基于图论距离最小化能量。

```typescript
import { layoutKK } from '@graphrs/layout';

const result = await layoutKK(graph);
```

### `layoutGraphopt(graph, options?)`

Graphopt 布局 —— 使用电荷和弹簧模型的力导向布局。

```typescript
import { layoutGraphopt } from '@graphrs/layout';

const result = await layoutGraphopt(graph, { iterations: 500 });
```

## 层次布局

### `layoutSugiyama(graph, options?)`

Sugiyama 分层布局 —— 在有向图中最小化边交叉。

```typescript
import { layoutSugiyama } from '@graphrs/layout';

const result = await layoutSugiyama(graph);
```

### `layoutReingoldTilford(graph, options?)`

Reingold-Tilford 树布局 —— 适用于树状图。

```typescript
import { layoutReingoldTilford } from '@graphrs/layout';

const result = await layoutReingoldTilford(graph, { root: 0 });
```

| 选项   | 类型     | 默认值 | 说明       |
| ------ | -------- | ------ | ---------- |
| `root` | `number` | `0`    | 树的根节点 |

## 几何布局

### `layoutCircle(graph)`

将节点排列成圆形。

### `layoutGrid(graph)`

将节点排列成网格。

### `layoutStar(graph)`

将节点排列成星形。

### `layoutRandom(graph)`

随机位置。

## 降维布局

### `layoutMDS(graph, options?)`

多维缩放 —— 保持图论距离。

### `layoutDRL(graph, options?)`

分布式递归布局 —— 力导向，适合大规模图。

## 结果类型

所有布局函数返回 `Promise<LayoutResult>`：

```typescript
{
  positions: [number, number][],  // [x, y] per node
}
```

与可视化序列化器配合使用：

```typescript
const layout = await layoutFR(graph);
const g6Data = graph.toG6Format(layout);
const rfData = graph.toReactFlowFormat(layout);
const cyData = graph.toCytoscapeFormat(layout);
```
