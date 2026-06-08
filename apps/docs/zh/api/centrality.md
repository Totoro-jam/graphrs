# @graphrs/centrality

中心性度量算法，用于对图中节点的重要性进行排名。

```bash
npm install @graphrs/centrality
```

## 函数

### `pagerank(graph, options?)`

Google 的 PageRank 算法。基于入链结构衡量节点重要性。

```typescript
import { pagerank } from '@graphrs/centrality';

const result = await pagerank(graph, { damping: 0.85 });
```

| 选项      | 类型     | 默认值 | 说明     |
| --------- | -------- | ------ | -------- |
| `damping` | `number` | `0.85` | 阻尼系数 |

### `betweenness(graph, options?)`

介数中心性 —— 衡量一个节点处于最短路径上的频率。

```typescript
import { betweenness } from '@graphrs/centrality';

const result = await betweenness(graph, { directed: false });
```

| 选项       | 类型      | 默认值 | 说明           |
| ---------- | --------- | ------ | -------------- |
| `directed` | `boolean` | 图的值 | 是否视为有向图 |

### `closeness(graph, options?)`

接近中心性 —— 衡量到所有其他节点的平均距离。

```typescript
import { closeness } from '@graphrs/centrality';

const result = await closeness(graph, { normalized: true });
```

| 选项         | 类型      | 默认值 | 说明           |
| ------------ | --------- | ------ | -------------- |
| `normalized` | `boolean` | `true` | 是否归一化分数 |

### `eigenvector(graph, options?)`

特征向量中心性 —— 基于邻居重要性衡量节点影响力。

```typescript
import { eigenvector } from '@graphrs/centrality';

const result = await eigenvector(graph);
```

### `hits(graph, options?)`

HITS（超链接诱导主题搜索）—— 计算枢纽值和权威值。

```typescript
import { hits } from '@graphrs/centrality';

const result = await hits(graph);
// result: HitsResult { hubs: number[], authorities: number[] }
```

**返回值**：`HitsResult`（继承自 `CentralityResult`）

### `katz(graph, options?)`

Katz 中心性 —— 使用衰减因子衡量影响力。

```typescript
import { katz } from '@graphrs/centrality';

const result = await katz(graph, { alpha: 0.1 });
```

| 选项    | 类型     | 默认值 | 说明     |
| ------- | -------- | ------ | -------- |
| `alpha` | `number` | `0.1`  | 衰减因子 |

### `harmonic(graph, options?)`

调和中心性 —— 使用距离的调和平均数的接近中心性变体。

```typescript
import { harmonic } from '@graphrs/centrality';

const result = await harmonic(graph);
```

## 结果类型

大多数函数返回 `Promise<CentralityResult>`：

```typescript
{
  scores: number[],  // centrality score per node
}
```
