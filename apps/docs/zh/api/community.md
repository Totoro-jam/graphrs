# @graphrs/community

社区检测算法，用于识别图中的簇和群组。每种算法使用不同的策略将节点划分为社区。

```bash
npm install @graphrs/community
```

## 基于模块度

通过优化模块度来检测社区 —— 模块度衡量网络分解为密集子组（组间连接稀疏）的质量。

### `louvain(graph, options?)`

Louvain 方法 —— 最广泛使用的社区检测算法。通过迭代的节点移动和社区聚合来贪心优化模块度。快速且可扩展，但社区内部可能不连通。

```typescript
import { Graph } from '@graphrs/core';
import { louvain } from '@graphrs/community';

const graph = Graph.fromEdges([
  [0,1],[1,2],[2,0],   // 集群 A
  [3,4],[4,5],[5,3],   // 集群 B
  [2,3],               // 桥接边
]);

const result = await louvain(graph, { resolution: 1.0 });
console.log(result.membership); // 例如 [0, 0, 0, 1, 1, 1]
console.log(result.modularity); // 例如 0.357
console.log(result.clusters);   // 2
```

| 选项         | 类型     | 默认值 | 说明                                     |
| ------------ | -------- | ------ | ---------------------------------------- |
| `resolution` | `number` | `1.0`  | 分辨率参数 —— 值越大，产生的社区越多越小 |

### `leiden(graph, options?)`

Leiden 算法 —— Louvain 的改进版本，保证社区的连通性。通过在每次聚合后细化社区来产生更高质量的划分。当划分质量重要时优先选择 Leiden 而非 Louvain。

```typescript
import { leiden } from '@graphrs/community';

const result = await leiden(graph, { resolution: 1.0 });
```

| 选项         | 类型     | 默认值 | 说明                 |
| ------------ | -------- | ------ | -------------------- |
| `resolution` | `number` | `1.0`  | 分辨率参数           |
| `beta`       | `number` | —      | 细化阶段的随机性参数 |
| `iterations` | `number` | —      | 最大迭代次数         |

### `fastGreedy(graph)`

快速贪心模块度优化 —— 层次聚合方法，在每一步合并社区以最大化模块度增益。无需调参。

```typescript
import { fastGreedy } from '@graphrs/community';

const result = await fastGreedy(graph);
console.log(result.clusters);   // 发现的社区数量
console.log(result.modularity); // 质量分数
```

### `spinglass(graph, options?)`

Spinglass 算法 —— 基于 Potts 自旋玻璃模型的统计力学方法。将社区检测视为寻找自旋系统的基态。能检测不同大小的社区，但要求图是连通的。

```typescript
import { spinglass } from '@graphrs/community';

const result = await spinglass(graph, { spins: 25 });
```

| 选项    | 类型     | 默认值 | 说明                         |
| ------- | -------- | ------ | ---------------------------- |
| `spins` | `number` | `25`   | 自旋数（社区数量的上限）     |
| `gamma` | `number` | —      | 社区间边的奖惩参数           |

## 信息论方法

### `infomap(graph, options?)`

Infomap 算法 —— 使用映射方程找到最小化图上随机游走描述长度的划分。擅长发现基于流的社区。结果中的 `modularity` 字段包含的是代码长度（描述长度），而非标准模块度。

```typescript
import { infomap } from '@graphrs/community';

const result = await infomap(graph, { trials: 10 });
console.log(result.modularity); // 代码长度（越低 = 划分越好）
```

| 选项     | 类型     | 默认值 | 说明                                       |
| -------- | -------- | ------ | ------------------------------------------ |
| `trials` | `number` | `10`   | 优化试验次数（次数越多结果越好，但越慢）   |

## 基于传播

标签或流体在网络中传播并稳定为社区的算法。

### `labelPropagation(graph, options?)`

标签传播 —— 快速的近线性时间社区检测。每个节点采用其邻居中最常见的标签。非确定性：不同运行结果可能不同。`modularity` 字段始终为 0（标签传播不优化模块度）。

```typescript
import { labelPropagation } from '@graphrs/community';

const result = await labelPropagation(graph);
console.log(result.clusters); // 发现的社区数量
```

| 选项    | 类型       | 默认值 | 说明                       |
| ------- | ---------- | ------ | -------------------------- |
| `fixed` | `number[]` | —      | 保持初始标签不变的节点索引 |

### `fluidCommunities(graph, options)`

流体社区 —— 基于传播的算法，模拟相互作用的流体将图划分为恰好 `numCommunities` 个组。与大多数算法不同，社区数量需要预先指定。`modularity` 字段始终为 0。

```typescript
import { fluidCommunities } from '@graphrs/community';

const result = await fluidCommunities(graph, { numCommunities: 3 });
console.log(result.clusters); // 3
```

| 选项             | 类型     | 默认值 | 说明               |
| ---------------- | -------- | ------ | ------------------ |
| `numCommunities` | `number` | 必填   | 要发现的确切社区数 |

## 基于随机游走

### `walktrap(graph, options?)`

Walktrap —— 使用短随机游走检测社区。同一社区中的节点倾向于具有相似的随机游走转移概率。生成层次树状图并在最大化模块度处切割。

```typescript
import { walktrap } from '@graphrs/community';

const result = await walktrap(graph, { steps: 4 });
```

| 选项    | 类型     | 默认值 | 说明                                 |
| ------- | -------- | ------ | ------------------------------------ |
| `steps` | `number` | `4`    | 随机游走长度（4–5 对大多数图效果好） |

## 如何选择算法

| 算法               | 策略     | 速度 | 可调参数                 | 最适合                     |
| ------------------ | -------- | ---- | ------------------------ | -------------------------- |
| `louvain`          | 模块度   | 快   | `resolution`             | 通用场景，首选             |
| `leiden`           | 模块度   | 快   | `resolution`, `beta`     | 高质量划分                 |
| `fastGreedy`       | 模块度   | 快   | 无                       | 快速基线，无需调参         |
| `infomap`          | 信息论   | 中等 | `trials`                 | 基于流/有向图的社区        |
| `labelPropagation` | 传播     | 极快 | `fixed`                  | 超大图（>100k 节点）       |
| `fluidCommunities` | 传播     | 快   | `numCommunities`         | 已知社区数量               |
| `walktrap`         | 随机游走 | 中等 | `steps`                  | 层次社区结构               |
| `spinglass`        | 统计力学 | 慢   | `spins`, `gamma`         | 中小规模连通图             |

## 结果类型

所有函数返回 `Promise<CommunityResult>`：

```typescript
interface CommunityResult {
  membership: number[];  // 每个节点的社区 ID（按节点顺序索引）
  modularity: number;    // 质量分数（-0.5 到 1.0），infomap 返回代码长度
  clusters: number;      // 发现的社区数量
}
```

## 完整示例

在同一个图上比较多种算法：

```typescript
import { Graph } from '@graphrs/core';
import {
  louvain, leiden, fastGreedy, infomap,
  labelPropagation, walktrap,
} from '@graphrs/community';

const graph = Graph.fromEdges([
  [0,1],[1,2],[2,0],       // 集群 A
  [3,4],[4,5],[5,3],       // 集群 B
  [6,7],[7,8],[8,6],       // 集群 C
  [2,3],[5,6],             // 桥接边
]);

const algorithms = [
  { name: 'Louvain',    fn: () => louvain(graph) },
  { name: 'Leiden',     fn: () => leiden(graph) },
  { name: 'FastGreedy', fn: () => fastGreedy(graph) },
  { name: 'Infomap',    fn: () => infomap(graph) },
  { name: 'LabelProp',  fn: () => labelPropagation(graph) },
  { name: 'Walktrap',   fn: () => walktrap(graph) },
];

for (const { name, fn } of algorithms) {
  const result = await fn();
  console.log(
    `${name}: ${result.clusters} 个社区, ` +
    `模块度=${result.modularity.toFixed(3)}, ` +
    `成员=[${result.membership.join(',')}]`
  );
}
```

## API 总结

| 函数               | 策略         | 返回值                    |
| ------------------ | ------------ | ------------------------- |
| `louvain`          | 模块度优化   | `Promise<CommunityResult>` |
| `leiden`           | 改进模块度   | `Promise<CommunityResult>` |
| `fastGreedy`       | 贪心模块度   | `Promise<CommunityResult>` |
| `infomap`          | 信息论       | `Promise<CommunityResult>` |
| `labelPropagation` | 标签传播     | `Promise<CommunityResult>` |
| `fluidCommunities` | 流体传播     | `Promise<CommunityResult>` |
| `walktrap`         | 随机游走     | `Promise<CommunityResult>` |
| `spinglass`        | 自旋玻璃模型 | `Promise<CommunityResult>` |
