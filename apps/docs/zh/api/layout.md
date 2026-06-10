# @graphrs/layout

图布局算法，用于计算节点位置。将抽象的图拓扑转换为 2D 坐标用于可视化。

```bash
npm install @graphrs/layout
```

## 力导向布局

模拟物理力（边沿的吸引力、所有节点间的排斥力）以找到美观的排列。

### `layoutFR(graph, options?)`

Fruchterman-Reingold 力导向布局 —— 通用的默认选择。对大多数图规模和拓扑都能产生良好结果。

```typescript
import { Graph } from '@graphrs/core';
import { layoutFR } from '@graphrs/layout';

const graph = Graph.fromEdges([[0,1],[1,2],[2,3],[3,0],[0,2]]);
const result = await layoutFR(graph, { iterations: 500 });
console.log(result.positions); // [[x0, y0], [x1, y1], ...]
```

| 选项         | 类型     | 默认值 | 说明       |
| ------------ | -------- | ------ | ---------- |
| `iterations` | `number` | `500`  | 模拟步数   |

### `layoutKK(graph, options?)`

Kamada-Kawai 弹簧布局 —— 基于图论距离最小化能量。产生的布局中节点位置反映最短路径距离。

```typescript
import { layoutKK } from '@graphrs/layout';

const result = await layoutKK(graph);
```

### `layoutGraphopt(graph, options?)`

Graphopt 布局 —— 使用电荷-弹簧模型的力导向布局。对中等规模图是 FR 的良好替代。

```typescript
import { layoutGraphopt } from '@graphrs/layout';

const result = await layoutGraphopt(graph, { iterations: 500 });
```

| 选项         | 类型     | 默认值 | 说明     |
| ------------ | -------- | ------ | -------- |
| `iterations` | `number` | `500`  | 模拟步数 |

### `layoutDRL(graph, options?)`

分布式递归布局 —— 专为超大图（10k+ 节点）设计的力导向算法。使用多层方法实现更好的可扩展性。

```typescript
import { layoutDRL } from '@graphrs/layout';

const result = await layoutDRL(largeGraph);
```

## 层次布局

将节点排列成层级以强调方向或层次结构。

### `layoutSugiyama(graph, options?)`

Sugiyama 分层布局 —— DAG（有向无环图）可视化的标准算法。最小化层间的边交叉。

```typescript
import { layoutSugiyama } from '@graphrs/layout';

const result = await layoutSugiyama(graph);
// 节点排列在水平层中，边向下流动
```

### `layoutReingoldTilford(graph, options?)`

Reingold-Tilford 树布局 —— 产生整洁紧凑的树状图，无边交叉。最适合树或近似树结构。

```typescript
import { layoutReingoldTilford } from '@graphrs/layout';

const result = await layoutReingoldTilford(graph, { root: 0 });
```

| 选项   | 类型     | 默认值 | 说明           |
| ------ | -------- | ------ | -------------- |
| `root` | `number` | `0`    | 树布局的根节点 |

## 几何布局

不依赖图结构的固定模式排列。

### `layoutCircle(graph)`

将所有节点均匀排列在圆上。适合环形拓扑和小规模图。

```typescript
import { layoutCircle } from '@graphrs/layout';

const result = await layoutCircle(graph);
```

### `layoutGrid(graph)`

将节点排列成规则的网格模式。

```typescript
import { layoutGrid } from '@graphrs/layout';

const result = await layoutGrid(graph);
```

### `layoutStar(graph)`

将节点排列成星形 —— 一个节点在中心，其他节点径向排列。

```typescript
import { layoutStar } from '@graphrs/layout';

const result = await layoutStar(graph);
```

### `layoutRandom(graph)`

随机位置 —— 可用作力导向细化的起始点。

```typescript
import { layoutRandom } from '@graphrs/layout';

const result = await layoutRandom(graph);
```

## 降维布局

### `layoutMDS(graph, options?)`

多维缩放 —— 定位节点使欧几里得距离近似图论距离。适合揭示全局结构。

```typescript
import { layoutMDS } from '@graphrs/layout';

const result = await layoutMDS(graph);
```

## 如何选择布局

| 算法                    | 类型   | 速度 | 最适合                     |
| ----------------------- | ------ | ---- | -------------------------- |
| `layoutFR`              | 力导向 | 中等 | 通用场景，首选             |
| `layoutKK`              | 力导向 | 中等 | 保持图论距离               |
| `layoutDRL`             | 力导向 | 快   | 超大图（>10k 节点）        |
| `layoutSugiyama`        | 层次   | 中等 | DAG、工作流、管线          |
| `layoutReingoldTilford` | 树形   | 快   | 树、组织架构图             |
| `layoutCircle`          | 几何   | 即时 | 环形拓扑、小规模图         |
| `layoutGrid`            | 几何   | 即时 | 规则排列                   |
| `layoutMDS`             | 降维   | 慢   | 揭示全局结构               |

## 结果类型

所有布局函数返回 `Promise<LayoutResult>`：

```typescript
interface LayoutResult {
  positions: [number, number][];  // 每个节点的 [x, y] 坐标
}
```

## 与可视化库配合使用

布局结果可以直接输入 graphrs 的序列化方法：

```typescript
import { Graph } from '@graphrs/core';
import { layoutFR } from '@graphrs/layout';

const graph = Graph.fromEdges([[0,1],[1,2],[2,0]]);
const layout = await layoutFR(graph);

// AntV G6
const g6Data = graph.toG6Format(layout);

// React Flow
const rfData = graph.toReactFlowFormat(layout);

// Cytoscape.js
const cyData = graph.toCytoscapeFormat(layout);
```

或使用专用集成包获得更丰富的功能：

```typescript
// @graphrs/g6 — 布局 + 社区检测 + 中心性管线
import { graphrsLayout } from '@graphrs/g6';

// @graphrs/react-flow — 带自动布局的 React hook
import { useGraphrsLayout } from '@graphrs/react-flow';
```

## API 总结

| 函数                    | 类型   | 返回值                  |
| ----------------------- | ------ | ----------------------- |
| `layoutFR`              | 力导向 | `Promise<LayoutResult>` |
| `layoutKK`              | 力导向 | `Promise<LayoutResult>` |
| `layoutGraphopt`        | 力导向 | `Promise<LayoutResult>` |
| `layoutDRL`             | 力导向 | `Promise<LayoutResult>` |
| `layoutSugiyama`        | 层次   | `Promise<LayoutResult>` |
| `layoutReingoldTilford` | 树形   | `Promise<LayoutResult>` |
| `layoutCircle`          | 几何   | `Promise<LayoutResult>` |
| `layoutGrid`            | 几何   | `Promise<LayoutResult>` |
| `layoutStar`            | 几何   | `Promise<LayoutResult>` |
| `layoutRandom`          | 几何   | `Promise<LayoutResult>` |
| `layoutMDS`             | 降维   | `Promise<LayoutResult>` |
