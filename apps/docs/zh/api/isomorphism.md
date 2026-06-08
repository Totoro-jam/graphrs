# @graphrs/isomorphism

结构匹配和对称性算法。

```bash
npm install @graphrs/isomorphism
```

## 函数

### `isIsomorphic(g1, g2)`

使用 VF2 算法检测两个图是否同构（结构相同）。

```typescript
import { isIsomorphic } from '@graphrs/isomorphism';

const result = await isIsomorphic(graph1, graph2);
```

### `subgraphIsomorphic(g1, g2)`

检测 g2 是否包含与 g1 同构的子图。

```typescript
import { subgraphIsomorphic } from '@graphrs/isomorphism';

const result = await subgraphIsomorphic(pattern, graph);
```

### `canonicalPermutation(graph)`

计算规范标记 —— 产生图的规范形式的置换。

```typescript
import { canonicalPermutation } from '@graphrs/isomorphism';

const perm = await canonicalPermutation(graph);
```

### `automorphismGroupSize(graph)`

计算自同构群的大小 —— 即对称性的数量。

```typescript
import { automorphismGroupSize } from '@graphrs/isomorphism';

const size = await automorphismGroupSize(graph);
```
