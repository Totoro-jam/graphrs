# @graphrs/community

社区检测算法，用于识别图中的簇和群组。

```bash
npm install @graphrs/community
```

## 函数

### `louvain(graph, options?)`

Louvain 方法用于社区检测，以贪心方式优化模块度。

```typescript
import { louvain } from '@graphrs/community';

const result = await louvain(graph, { resolution: 1.0 });
```

| 选项         | 类型     | 默认值 | 说明                           |
| ------------ | -------- | ------ | ------------------------------ |
| `resolution` | `number` | `1.0`  | 分辨率参数（值越大，社区越多） |

**返回值**：`CommunityResult`

### `leiden(graph, options?)`

Leiden 算法 —— Louvain 的改进版本，保证社区的连通性。

```typescript
import { leiden } from '@graphrs/community';

const result = await leiden(graph, { resolution: 1.0 });
```

| 选项         | 类型     | 默认值 | 说明       |
| ------------ | -------- | ------ | ---------- |
| `resolution` | `number` | `1.0`  | 分辨率参数 |

### `infomap(graph, options?)`

Infomap 算法 —— 使用信息论方法（随机游走压缩）。

```typescript
import { infomap } from '@graphrs/community';

const result = await infomap(graph, { trials: 10 });
```

| 选项     | 类型     | 默认值 | 说明         |
| -------- | -------- | ------ | ------------ |
| `trials` | `number` | `10`   | 优化试验次数 |

### `labelPropagation(graph, options?)`

标签传播 —— 快速的近线性时间社区检测。

```typescript
import { labelPropagation } from '@graphrs/community';

const result = await labelPropagation(graph);
```

### `walktrap(graph, options?)`

Walktrap —— 使用短随机游走检测社区。

```typescript
import { walktrap } from '@graphrs/community';

const result = await walktrap(graph, { steps: 4 });
```

| 选项    | 类型     | 默认值 | 说明         |
| ------- | -------- | ------ | ------------ |
| `steps` | `number` | `4`    | 随机游走长度 |

### `fastGreedy(graph)`

快速贪心模块度优化 —— 层次聚合方法。

```typescript
import { fastGreedy } from '@graphrs/community';

const result = await fastGreedy(graph);
```

### `spinglass(graph, options?)`

Spinglass 算法 —— 统计力学方法。

```typescript
import { spinglass } from '@graphrs/community';

const result = await spinglass(graph, { spins: 25 });
```

| 选项    | 类型     | 默认值 | 说明   |
| ------- | -------- | ------ | ------ |
| `spins` | `number` | `25`   | 自旋数 |

### `fluidCommunities(graph, options?)`

流体社区 —— 基于传播的 k 社区算法。

```typescript
import { fluidCommunities } from '@graphrs/community';

const result = await fluidCommunities(graph, { k: 3 });
```

| 选项 | 类型     | 默认值 | 说明     |
| ---- | -------- | ------ | -------- |
| `k`  | `number` | 必填   | 社区数量 |

## 结果类型

所有函数返回 `Promise<CommunityResult>`：

```typescript
{
  membership: number[],  // community assignment per node
  modularity: number,    // quality score (-0.5 to 1.0)
  clusters: number,      // number of communities found
}
```
