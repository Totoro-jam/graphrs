# @graphrs/isomorphism

结构匹配和对称性算法。判断两个图是否具有相同结构、在大图中查找模式匹配、分析结构对称性。

```bash
npm install @graphrs/isomorphism
```

## 图同构

### `isIsomorphic(g1, g2)`

检测两个图是否同构 —— 即在节点重标记后结构完全相同。使用 VF2 算法，对大多数实际规模的图都很高效。

```typescript
import { Graph } from '@graphrs/core';
import { isIsomorphic } from '@graphrs/isomorphism';

// 这两个图是同构的（相同的三角形结构）
const g1 = Graph.fromEdges([[0, 1], [1, 2], [2, 0]]);
const g2 = Graph.fromEdges([[5, 6], [6, 7], [7, 5]]);

const result = await isIsomorphic(g1, g2);
console.log(result); // true
```

**参数：**

| 参数  | 类型    | 说明    |
| ----- | ------- | ------- |
| `g1`  | `Graph` | 第一个图 |
| `g2`  | `Graph` | 第二个图 |

**返回值：** `Promise<boolean>` —— 如果存在保持所有边的节点集双射，则为 `true`。

::: tip 使用场景
用同构测试来去重图数据集、检查两种表示是否编码相同的网络、或验证变换是否保持了结构。
:::

## 子图同构

### `subgraphIsomorphic(g1, g2)`

检测 `g2` 是否包含与 `g1` 同构的子图。这是模式匹配问题 —— "这个模体是否出现在更大的图中？"

```typescript
import { Graph } from '@graphrs/core';
import { subgraphIsomorphic } from '@graphrs/isomorphism';

// 模式：一个三角形
const pattern = Graph.fromEdges([[0, 1], [1, 2], [2, 0]]);

// 宿主图：包含三角形的更大的图
const host = Graph.fromEdges([
  [0, 1], [1, 2], [2, 0],  // 这里有三角形
  [2, 3], [3, 4],           // 向外延伸的路径
]);

const found = await subgraphIsomorphic(pattern, host);
console.log(found); // true — 三角形存在于 `host` 中
```

**参数：**

| 参数      | 类型    | 说明                           |
| --------- | ------- | ------------------------------ |
| `g1`      | `Graph` | 模式图（要搜索的子图）         |
| `g2`      | `Graph` | 宿主图（在其中搜索的图）       |

**返回值：** `Promise<boolean>` —— 如果 `g1` 作为 `g2` 的子图出现，则为 `true`。

::: tip 使用场景
子图同构是生物网络中模体发现、交易图中欺诈模式检测、分子图中模板匹配的基础。
:::

## 规范形式

### `canonicalPermutation(graph)`

计算规范标记 —— 将节点 ID 映射到规范排序的置换。两个同构的图产生相同的规范形式，因此可以用作图的哈希或指纹。

```typescript
import { Graph } from '@graphrs/core';
import { canonicalPermutation } from '@graphrs/isomorphism';

const graph = Graph.fromEdges([[0, 1], [1, 2], [2, 0]]);
const perm = await canonicalPermutation(graph);
console.log(perm); // 例如 [2, 0, 1] — 规范节点重排
```

**参数：**

| 参数    | 类型    | 说明   |
| ------- | ------- | ------ |
| `graph` | `Graph` | 输入图 |

**返回值：** `Promise<number[]>` —— 置换数组，其中 `perm[i]` 是节点 `i` 的规范位置。

::: tip 使用场景
使用规范置换来构建图数据库的查找表：计算一次规范形式，然后将其用作键进行 O(1) 同构查找。
:::

## 自同构群

### `automorphismGroupSize(graph)`

计算自同构群的大小 —— 即图在保持所有边的情况下能映射到自身的不同方式的数量。具有许多对称性的图有更大的自同构群。

```typescript
import { Graph } from '@graphrs/core';
import { automorphismGroupSize } from '@graphrs/isomorphism';

// 完全图 K4 — 高度对称
const k4 = Graph.fromEdges([
  [0, 1], [0, 2], [0, 3],
  [1, 2], [1, 3], [2, 3],
]);
const size = await automorphismGroupSize(k4);
console.log(size); // 24（= 4! 因为 K4 的任何排列都是自同构）

// 路径图 0-1-2 — 较少对称
const path = Graph.fromEdges([[0, 1], [1, 2]]);
const pathSize = await automorphismGroupSize(path);
console.log(pathSize); // 2（仅有恒等映射和翻转）
```

**参数：**

| 参数    | 类型    | 说明   |
| ------- | ------- | ------ |
| `graph` | `Graph` | 输入图 |

**返回值：** `Promise<number>` —— 自同构（自身到自身的同构映射）的数量。

## 完整示例

分析图的结构属性：

```typescript
import { Graph } from '@graphrs/core';
import {
  isIsomorphic,
  subgraphIsomorphic,
  canonicalPermutation,
  automorphismGroupSize,
} from '@graphrs/isomorphism';

// Petersen 图的一种表示
const g1 = Graph.fromEdges([
  [0,1],[1,2],[2,3],[3,4],[4,0],
  [0,5],[1,6],[2,7],[3,8],[4,9],
  [5,7],[7,9],[9,6],[6,8],[8,5],
]);

// 检查对称性
const auts = await automorphismGroupSize(g1);
console.log(`自同构数: ${auts}`); // 120

// 规范指纹
const perm = await canonicalPermutation(g1);
console.log(`规范置换:`, perm);

// 搜索 5 环模体
const cycle5 = Graph.fromEdges([[0,1],[1,2],[2,3],[3,4],[4,0]]);
const hasCycle = await subgraphIsomorphic(cycle5, g1);
console.log(`包含 5 环: ${hasCycle}`); // true
```

## API 总结

| 函数                    | 签名                | 返回值              | 说明             |
| ----------------------- | ------------------- | ------------------- | ---------------- |
| `isIsomorphic`          | `(g1, g2)`          | `Promise<boolean>`  | 测试结构等价性   |
| `subgraphIsomorphic`    | `(pattern, host)`   | `Promise<boolean>`  | 测试模式包含性   |
| `canonicalPermutation`  | `(graph)`           | `Promise<number[]>` | 规范节点排序     |
| `automorphismGroupSize` | `(graph)`           | `Promise<number>`   | 对称性数量       |
