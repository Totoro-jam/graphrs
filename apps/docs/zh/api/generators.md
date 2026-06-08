# @graphrs/generators

图生成器，用于创建具有已知属性的合成图。

```bash
npm install @graphrs/generators
```

## 随机图

### `erdosRenyi(options)`

Erdos-Renyi 随机图 —— 每条边以概率 p 独立存在。

```typescript
import { erdosRenyi } from '@graphrs/generators';

const graph = await erdosRenyi({ n: 100, p: 0.05 });
```

| 选项       | 类型       | 说明               |
| ---------- | ---------- | ------------------ |
| `n`        | `number`   | 节点数量           |
| `p`        | `number`   | 边的概率（0 到 1） |
| `directed` | `boolean?` | 是否为有向图       |

### `barabasiAlbert(options)`

Barabasi-Albert 优先连接 —— 产生无标度网络。

```typescript
import { barabasiAlbert } from '@graphrs/generators';

const graph = await barabasiAlbert({ n: 1000, m: 3 });
```

| 选项       | 类型       | 说明             |
| ---------- | ---------- | ---------------- |
| `n`        | `number`   | 节点数量         |
| `m`        | `number`   | 每个新节点的边数 |
| `directed` | `boolean?` | 是否为有向图     |

### `wattsStrogatz(options)`

Watts-Strogatz 小世界网络。

```typescript
import { wattsStrogatz } from '@graphrs/generators';

const graph = await wattsStrogatz({ n: 100, k: 4, p: 0.1 });
```

| 选项 | 类型     | 说明               |
| ---- | -------- | ------------------ |
| `n`  | `number` | 节点数量           |
| `k`  | `number` | 每个节点的邻域大小 |
| `p`  | `number` | 重连概率           |

### `stochasticBlockModel(options)`

随机块模型 —— 生成具有社区结构的图。

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
```

## 确定性图

### `complete(n, directed?)`

完全图 —— 每个节点都与其他所有节点相连。

### `ring(n)`

环图/圈图 —— 节点连成一个环。

### `lattice(dims)`

格子图 —— 任意维度的网格。

```typescript
import { lattice } from '@graphrs/generators';

const graph2d = await lattice([10, 10]); // 10x10 grid
const graph3d = await lattice([5, 5, 5]); // 5x5x5 cube
```

### `star(n)`

星形图 —— 一个中心节点连接到所有其他节点。

### `tree(n)`

具有 n 个节点的随机树。

### `path(n)`

路径图 —— 节点连成一条线。

## 返回类型

所有生成器返回 `Promise<Graph>`。
