# @graphrs/centrality

中心性度量算法，用于对图中节点的重要性进行排名。每种算法从不同角度定义什么是"重要"的节点。

```bash
npm install @graphrs/centrality
```

## 函数

### `pagerank(graph, options?)`

Google 的 PageRank 算法。基于入链结构衡量节点重要性 —— 如果一个节点被其他重要节点链接，则该节点也是重要的。

```typescript
import { Graph } from '@graphrs/core';
import { pagerank } from '@graphrs/centrality';

const graph = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0], [2, 3],
]);

const result = await pagerank(graph, { damping: 0.85 });
console.log(result.scores); // 每个节点的重要性分数
```

| 选项         | 类型     | 默认值 | 说明                           |
| ------------ | -------- | ------ | ------------------------------ |
| `damping`    | `number` | `0.85` | 跟随链接 vs 随机跳转的概率     |
| `iterations` | `number` | —      | 最大迭代次数                   |
| `tolerance`  | `number` | —      | 收敛阈值                       |

### `betweenness(graph, options?)`

介数中心性 —— 衡量一个节点处于其他节点之间最短路径上的频率。介数高的节点是控制信息流的"桥梁"或"中间人"。

```typescript
import { betweenness } from '@graphrs/centrality';

const result = await betweenness(graph, { directed: false });
console.log(result.scores); // 每个节点的介数分数
```

| 选项         | 类型      | 默认值 | 说明                 |
| ------------ | --------- | ------ | -------------------- |
| `directed`   | `boolean` | 图的值 | 是否将边视为有向     |
| `normalized` | `boolean` | —      | 将分数归一化到 [0, 1] |

### `closeness(graph, options?)`

接近中心性 —— 衡量一个节点到所有其他节点的距离。定义为平均最短路径距离的倒数。接近中心性高的节点能快速到达所有其他节点。

```typescript
import { closeness } from '@graphrs/centrality';

const result = await closeness(graph, { normalized: true });
console.log(result.scores); // 每个节点的接近中心性分数
```

| 选项         | 类型      | 默认值 | 说明           |
| ------------ | --------- | ------ | -------------- |
| `normalized` | `boolean` | `true` | 按 (n-1) 归一化 |

### `eigenvector(graph, options?)`

特征向量中心性 —— 通过考虑邻居的重要性来衡量影响力。如果一个节点连接到其他重要节点，它就是重要的（PageRank 放宽了这个自引用定义）。

```typescript
import { eigenvector } from '@graphrs/centrality';

const result = await eigenvector(graph);
console.log(result.scores);
```

| 选项    | 类型      | 默认值 | 说明       |
| ------- | --------- | ------ | ---------- |
| `scale` | `boolean` | —      | 缩放结果   |

### `hits(graph, options?)`

HITS（超链接诱导主题搜索）—— 为每个节点计算两个分数：**枢纽值**（链接到好的权威节点）和**权威值**（被好的枢纽节点链接）。专为有向链接分析设计。

```typescript
import { hits } from '@graphrs/centrality';

const result = await hits(graph);
console.log(result.hubs);        // 枢纽分数
console.log(result.authorities); // 权威分数
```

| 选项         | 类型     | 默认值 | 说明       |
| ------------ | -------- | ------ | ---------- |
| `iterations` | `number` | —      | 最大迭代次数 |
| `tolerance`  | `number` | —      | 收敛阈值     |

**返回值：** `Promise<HitsResult>`（与其他中心性函数不同）

```typescript
interface HitsResult {
  hubs: number[];        // 每个节点的枢纽分数
  authorities: number[]; // 每个节点的权威分数
}
```

### `katz(graph, options?)`

Katz 中心性 —— 通过计算从节点出发的所有路径来衡量影响力，较长的路径以因子 α 衰减。是度中心性的推广。

```typescript
import { katz } from '@graphrs/centrality';

const result = await katz(graph, { alpha: 0.1 });
console.log(result.scores);
```

| 选项    | 类型     | 默认值 | 说明                        |
| ------- | -------- | ------ | --------------------------- |
| `alpha` | `number` | `0.1`  | 衰减因子（必须 < 1/λ₁）    |
| `beta`  | `number` | —      | 外生因子权重                |

### `harmonic(graph, options?)`

调和中心性 —— 使用距离的调和平均数而非算术平均数的接近中心性变体。优雅地处理非连通图（不可达节点贡献 0 而不是使分数变为未定义）。

```typescript
import { harmonic } from '@graphrs/centrality';

const result = await harmonic(graph);
console.log(result.scores);
```

| 选项         | 类型      | 默认值 | 说明           |
| ------------ | --------- | ------ | -------------- |
| `normalized` | `boolean` | —      | 是否归一化分数 |

## 结果类型

大多数函数返回 `Promise<CentralityResult>`：

```typescript
interface CentralityResult {
  scores: number[];  // 每个节点的中心性分数（按节点顺序索引）
}
```

例外：`hits()` 返回 `HitsResult`，包含独立的 `hubs` 和 `authorities` 数组。

## 完整示例

比较多种中心性度量以理解节点角色：

```typescript
import { Graph } from '@graphrs/core';
import { pagerank, betweenness, closeness } from '@graphrs/centrality';

const graph = Graph.fromEdges([
  [0,1],[1,2],[2,0],   // 集群 A
  [3,4],[4,5],[5,3],   // 集群 B
  [2,3],               // 桥接边
]);

const [pr, bw, cl] = await Promise.all([
  pagerank(graph),
  betweenness(graph),
  closeness(graph),
]);

graph.nodes().forEach((id, i) => {
  console.log(
    `节点 ${id}: PR=${pr.scores[i]!.toFixed(3)}, ` +
    `BW=${bw.scores[i]!.toFixed(3)}, CL=${cl.scores[i]!.toFixed(3)}`
  );
});
// 节点 2 和 3 将有最高的介数中心性（桥接节点）
```

## API 总结

| 函数           | 返回值              | 最适合                           |
| -------------- | ------------------- | -------------------------------- |
| `pagerank`     | `CentralityResult`  | 按影响力全局排名                 |
| `betweenness`  | `CentralityResult`  | 发现桥梁和瓶颈                   |
| `closeness`    | `CentralityResult`  | 发现最短到达距离的节点           |
| `eigenvector`  | `CentralityResult`  | 连接到重要节点的节点             |
| `hits`         | `HitsResult`        | 有向链接分析（枢纽 & 权威）     |
| `katz`         | `CentralityResult`  | 带衰减的远程影响力               |
| `harmonic`     | `CentralityResult`  | 非连通图的接近中心性             |
