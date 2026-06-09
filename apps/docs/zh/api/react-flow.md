# @graphrs/react-flow

适用于 [React Flow](https://reactflow.dev/)（xyflow）的 React Hook 和适配器。一个 Hook 调用即可在 React Flow 图上运行 graphrs 布局算法。

```bash
npm install @graphrs/react-flow @xyflow/react
```

## Hook

### `useGraphrsLayout(nodes, edges, options?)`

在 React Flow 节点和边上运行 graphrs 布局算法的 React Hook。

```tsx
import { useGraphrsLayout } from '@graphrs/react-flow';

const { nodes, edges, isLayouting, runLayout } = useGraphrsLayout(
  initialNodes,
  initialEdges,
  { algorithm: 'fruchterman-reingold', iterations: 500 },
);
```

**参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| `inputNodes` | `Node[]` | React Flow 节点 |
| `inputEdges` | `Edge[]` | React Flow 边 |
| `options` | `UseGraphrsLayoutOptions` | 布局配置 |

**返回**: `UseGraphrsLayoutResult`

```typescript
interface UseGraphrsLayoutResult {
  nodes: Node[];           // 已布局的节点（位置已更新）
  edges: Edge[];           // 输入边的透传
  isLayouting: boolean;    // 布局计算中为 true
  runLayout: (algorithm?: LayoutAlgorithm) => Promise<void>;  // 手动触发
}
```

**行为**:
- 当 `enabled` 为 `true`（默认）时，节点/边变化时自动运行布局
- 当 `enabled` 为 `false` 时，使用 `runLayout()` 手动触发
- `runLayout()` 接受可选的算法覆盖参数

### `UseGraphrsLayoutOptions`

```typescript
interface UseGraphrsLayoutOptions {
  algorithm?: LayoutAlgorithm;   // 默认: 'fruchterman-reingold'
  iterations?: number;           // FR 迭代次数（默认: 内部值）
  enabled?: boolean;             // 变化时自动布局（默认: true）
}

type LayoutAlgorithm =
  | 'fruchterman-reingold'
  | 'kamada-kawai'
  | 'circle'
  | 'grid'
  | 'star'
  | 'random';
```

## 适配器

### `reactFlowToGraph(nodes, edges, options?)`

将 React Flow 节点和边转换为 graphrs `Graph`。

```typescript
import { reactFlowToGraph } from '@graphrs/react-flow';

const { graph, idMap } = reactFlowToGraph(nodes, edges, { directed: true });
```

- React Flow 使用字符串 ID；graphrs 使用数字 ID
- 节点按数组顺序分配连续数字 ID (0, 1, 2, ...)
- 节点 `data` 保留为图中的节点数据
- 引用未知节点的边会被跳过

**参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| `nodes` | `Node[]` | React Flow 节点 |
| `edges` | `Edge[]` | React Flow 边 |
| `options.directed` | `boolean` | 有向图（默认: `true`） |

**返回**: `{ graph: Graph; idMap: Map<number, string> }`

### `applyLayout(nodes, layout, options?)`

将 graphrs `LayoutResult` 应用到 React Flow 节点。返回新数组（不可变）。

```typescript
import { applyLayout } from '@graphrs/react-flow';

const layoutedNodes = applyLayout(nodes, layoutResult, { scale: 200 });
```

每个节点获得来自布局的 `position.x` 和 `position.y`。`scale` 参数（默认: `200`）将原始布局坐标乘以此值，以产生适合 React Flow 画布的合理像素位置。

**参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| `nodes` | `Node[]` | React Flow 节点 |
| `layout` | `LayoutResult` | graphrs 布局结果 |
| `options.scale` | `number` | 坐标乘数（默认: `200`） |

**返回**: `Node[]`

## Peer Dependencies

- `@xyflow/react` >= 12.0.0
- `react` >= 18.0.0
