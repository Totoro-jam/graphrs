# @graphrs/isomorphism

Structural matching and symmetry algorithms.

```bash
npm install @graphrs/isomorphism
```

## Functions

### `isIsomorphic(g1, g2)`

Test whether two graphs are isomorphic (structurally identical) using the VF2 algorithm.

```typescript
import { isIsomorphic } from '@graphrs/isomorphism';

const result = await isIsomorphic(graph1, graph2);
```

### `subgraphIsomorphic(g1, g2)`

Test whether g2 contains a subgraph isomorphic to g1.

```typescript
import { subgraphIsomorphic } from '@graphrs/isomorphism';

const result = await subgraphIsomorphic(pattern, graph);
```

### `canonicalPermutation(graph)`

Compute the canonical labeling — a permutation that produces a canonical form of the graph.

```typescript
import { canonicalPermutation } from '@graphrs/isomorphism';

const perm = await canonicalPermutation(graph);
```

### `automorphismGroupSize(graph)`

Compute the size of the automorphism group — the number of symmetries.

```typescript
import { automorphismGroupSize } from '@graphrs/isomorphism';

const size = await automorphismGroupSize(graph);
```
