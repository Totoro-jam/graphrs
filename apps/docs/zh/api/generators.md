# @graphrs/generators

图生成器，用于创建具有已知属性的合成图。适用于测试算法、性能基准测试和构建模拟网络。

```bash
npm install @graphrs/generators
```

## 随机图模型

### `erdosRenyi(options)`

Erdos-Renyi 随机图 (G(n, p) 模型) —— 每条可能的边以概率 p 独立存在。最简单的随机图模型，在理论分析中广泛使用。

```typescript
import { erdosRenyi } from '@graphrs/generators';

const graph = await erdosRenyi({ n: 100, p: 0.05 });
console.log(graph.nodeCount()); // 100
console.log(graph.edgeCount()); // ~250（期望值: n*(n-1)/2 * p）
```

| 选项       | 类型       | 说明               |
| ---------- | ---------- | ------------------ |
| `n`        | `number`   | 节点数量           |
| `p`        | `number`   | 边的概率（0 到 1） |
| `directed` | `boolean?` | 创建有向图         |

### `barabasiAlbert(options)`

Barabasi-Albert 优先连接模型 —— 产生无标度网络，少数节点成为高度连接的枢纽。模拟网页、社交网络和引用图等真实世界网络。

```typescript
import { barabasiAlbert } from '@graphrs/generators';

const graph = await barabasiAlbert({ n: 1000, m: 3 });
// 产生幂律度分布
```

| 选项       | 类型       | 说明                       |
| ---------- | ---------- | -------------------------- |
| `n`        | `number`   | 总节点数量                 |
| `m`        | `number`   | 每个新节点添加的边数（控制密度） |
| `directed` | `boolean?` | 创建有向图                 |

### `wattsStrogatz(options)`

Watts-Strogatz 小世界网络 —— 从环状格子开始，随机重连边。产生高聚类系数和短平均路径长度的图，类似社交网络。

```typescript
import { wattsStrogatz } from '@graphrs/generators';

const graph = await wattsStrogatz({ n: 100, k: 4, p: 0.1 });
```

| 选项 | 类型     | 说明                             |
| ---- | -------- | -------------------------------- |
| `n`  | `number` | 节点数量                         |
| `k`  | `number` | 每个节点的邻域大小（必须为偶数） |
| `p`  | `number` | 重连概率（0 = 环，1 = 随机）     |

### `stochasticBlockModel(options)`

随机块模型 (SBM) —— 生成具有预设社区结构的图。节点被分为若干块，边的概率取决于块的成员关系。非常适合测试社区检测算法。

```typescript
import { stochasticBlockModel } from '@graphrs/generators';

const graph = await stochasticBlockModel({
  blockSizes: [30, 30, 30],
  prefMatrix: [
    [0.5, 0.01, 0.01],
    [0.01, 0.5, 0.01],
    [0.01, 0.01, 0.5],
  ],
});
// 90 个节点分成 3 个分离良好的社区
```

| 选项         | 类型         | 说明                   |
| ------------ | ------------ | ---------------------- |
| `blockSizes` | `number[]`   | 每个块/社区的大小      |
| `prefMatrix` | `number[][]` | 块之间的边概率矩阵     |

## 确定性图

具有已知拓扑属性的经典图结构。

### `complete(n, directed?)`

完全图 K_n —— 每个节点都与其他所有节点相连。有 n*(n-1)/2 条边（无向图）。

```typescript
import { complete } from '@graphrs/generators';

const k10 = await complete(10);
console.log(k10.edgeCount()); // 45
```

### `ring(n)`

环图 (圈图) C_n —— 节点连成一个环。每个节点的度为 2。

```typescript
import { ring } from '@graphrs/generators';

const cycle = await ring(12);
console.log(cycle.edgeCount()); // 12
```

### `lattice(dims)`

格子图 —— 任意维度的网格。每个节点沿各轴连接到其邻居。

```typescript
import { lattice } from '@graphrs/generators';

const grid2d = await lattice([10, 10]);    // 100 个节点，2D 网格
const grid3d = await lattice([5, 5, 5]);   // 125 个节点，3D 立方体
```

### `star(n)`

星形图 S_n —— 一个中心节点连接到所有 n-1 个叶节点。中心度为 n-1，叶节点度为 1。

```typescript
import { star } from '@graphrs/generators';

const s = await star(10);
console.log(s.degree(0)); // 9（中心节点）
```

### `tree(n)`

具有 n 个节点的随机树 —— 连通、无环、恰好 n-1 条边。

```typescript
import { tree } from '@graphrs/generators';

const t = await tree(50);
console.log(t.edgeCount()); // 49
```

### `path(n)`

路径图 P_n —— 节点连成一条线。最简单的连通图。

```typescript
import { path as pathGraph } from '@graphrs/generators';

const p = await pathGraph(5);
// 0 — 1 — 2 — 3 — 4
```

## 如何选择生成器

| 生成器                | 属性                   | 使用场景                 |
| --------------------- | ---------------------- | ------------------------ |
| `erdosRenyi`          | 均匀随机，泊松度分布   | 零模型，随机基线         |
| `barabasiAlbert`      | 无标度，幂律度分布     | 网络/社交网络模拟        |
| `wattsStrogatz`       | 小世界，高聚类         | 社交网络建模             |
| `stochasticBlockModel`| 预设社区               | 测试社区检测             |
| `complete`            | 最大密度               | 最坏情况算法测试         |
| `ring`                | 正则，2-连通           | 对称性测试               |
| `lattice`             | 正则，空间性           | 基于网格的模拟           |
| `star`                | 最大中心化             | 枢纽-辐射拓扑            |
| `tree`                | 无环，最小连通         | 树算法测试               |
| `path`                | 线性，最小结构         | 边界情况测试             |

## 完整示例

生成测试图并进行算法基准测试：

```typescript
import { erdosRenyi, barabasiAlbert, complete } from '@graphrs/generators';
import { louvain } from '@graphrs/community';
import { pagerank } from '@graphrs/centrality';

// 在不同拓扑上比较社区检测
const graphs = await Promise.all([
  erdosRenyi({ n: 200, p: 0.03 }),
  barabasiAlbert({ n: 200, m: 2 }),
  complete(20),
]);

for (const graph of graphs) {
  const communities = await louvain(graph);
  const pr = await pagerank(graph);
  const maxPR = Math.max(...pr.scores);
  console.log(
    `${graph.nodeCount()} 个节点, ${graph.edgeCount()} 条边: ` +
    `${communities.clusters} 个社区, 最大 PR=${maxPR.toFixed(4)}`
  );
}
```

## 返回类型

所有生成器返回 `Promise<Graph>`。
