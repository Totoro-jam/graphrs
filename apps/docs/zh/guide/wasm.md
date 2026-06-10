# WASM 与许可

## 架构

graphrs 封装了 [rust-igraph](https://github.com/Totoro-jam/rust-igraph) —— [igraph](https://igraph.org/) 图算法库的 Rust 绑定 —— 编译为 WebAssembly。架构如下：

```
你的 TypeScript 代码
  → @graphrs/* 包 (MIT, TypeScript)
    → @graphrs/core WASM 加载器
      → igraph-wasm 二进制 (GPL-2.0, ~2.3 MB)
        → rust-igraph (igraph 的 Rust FFI 绑定)
```

WASM 二进制文件包含了所有 400+ igraph 算法的已编译 C/Rust 代码。它只加载一次，在所有 `@graphrs/*` 包之间共享。

## 许可协议

graphrs 采用**双重许可**模式：

| 组件                                    | 许可协议    | 含义                        |
| --------------------------------------- | ----------- | --------------------------- |
| TypeScript 包 (`@graphrs/*`)            | **MIT**     | 可在任何项目中自由使用      |
| WASM 二进制文件 (`igraph_wasm_bg.wasm`) | **GPL-2.0** | Copyleft 适用于该二进制文件 |

WASM 二进制文件的 GPL-2.0 许可意味着：

- `.wasm` 文件本身是 GPL-2.0（因为它链接了 GPL-2.0 的 igraph）
- 你的 TypeScript 代码*调用* WASM 函数**不受** GPL 约束
- 你**不需要**开源你的应用程序
- 如果你修改并重新分发 WASM 二进制文件本身，则 GPL-2.0 适用

独立的 WASM 包发布为 [`@graphrs/igraph-wasm`](https://www.npmjs.com/package/@graphrs/igraph-wasm)。

## WASM 加载

WASM 模块在首次算法调用时自动加载：

```typescript
import { pagerank } from '@graphrs/centrality';

// 首次调用触发 WASM 加载（约 1-2ms）
const result = await pagerank(graph);

// 后续调用 — WASM 已缓存，立即执行
const result2 = await pagerank(anotherGraph);
```

### 环境检测

`@graphrs/core` 自动检测运行时环境：

- **Node.js**：使用 `fs.readFile` 从磁盘读取 `.wasm` 文件
- **浏览器**：通过 URL 获取 `.wasm` 文件（使用 `new URL(..., import.meta.url)`）

无需手动配置 —— 在两种环境中都开箱即用。

### 检查 WASM 状态

可以通过编程方式检查 WASM 状态：

```typescript
import { isWasmInitialized, getWasmSync } from '@graphrs/core';

isWasmInitialized(); // 首次算法调用前为 false
getWasmSync();       // 初始化前为 null，之后为 WasmExports
```

### 数据流

当你调用算法函数时，数据经过以下步骤：

```
1. 你的 Graph 对象 (TypeScript)
2. → 边对序列化为 Uint32Array
3. → WasmGraph.fromEdges() 在 WASM 内存中创建图
4. → 算法在 WASM 沙箱中以原生速度运行
5. → 结果序列化为 JSON 字符串
6. → JSON.parse() 转回类型化 TypeScript 对象
7. → WASM 图被释放 (wg.free())
```

所有这些都在每个算法函数内部自动发生。

## 打包配置

### Vite

开箱即用 —— Vite 原生支持 WASM 导入。

### webpack 5

启用 `asyncWebAssembly` 实验特性：

```javascript
// webpack.config.js
module.exports = {
  experiments: {
    asyncWebAssembly: true,
  },
};
```

### Next.js

在 Next.js 中使用 webpack：

```javascript
// next.config.js
module.exports = {
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    return config;
  },
};
```

### Rollup

使用 [`@rollup/plugin-wasm`](https://github.com/nicolo-ribaudo/rollup-plugin-wasm)：

```javascript
import { wasm } from '@rollup/plugin-wasm';

export default {
  plugins: [wasm()],
};
```

## 性能

| 指标             | 数值                                    |
| ---------------- | --------------------------------------- |
| WASM 二进制大小  | ~2.3 MB（未压缩），~800 KB（gzip 后）  |
| 初始化时间       | ~1-2 ms（一次性开销）                  |
| 算法执行速度     | 接近原生速度（比纯 JS 快 10-100 倍）   |
| 内存管理         | 在 WASM 沙箱中自动管理                 |

### 性能优化建议

- **并行算法**：使用 `Promise.all()` 并发运行独立的算法。WASM 模块能正确处理并发。
- **大图**：对于 >100k 节点的图，优先使用 `layoutDRL` 而非 `layoutFR`，使用 `labelPropagation` 而非 `louvain`。
- **重复分析**：`Graph` 对象是纯 TypeScript —— 只有调用算法函数时才会触发 WASM。创建和操作图是即时的。

## 错误处理

WASM 错误会被捕获并重新抛出为类型化的 TypeScript 错误：

```typescript
import { GraphError, WasmError } from '@graphrs/core';

try {
  const result = await pagerank(graph);
} catch (e) {
  if (e instanceof WasmError) {
    // 来自 WASM 二进制内部的错误
    console.error('WASM 错误:', e.message);
  } else if (e instanceof GraphError) {
    // 来自 TypeScript 封装层的错误
    console.error('图错误:', e.message);
  }
}
```

常见错误：

| 错误                       | 原因                                          |
| -------------------------- | --------------------------------------------- |
| `NodeNotFoundError`        | 引用了不存在的节点 ID                         |
| `EdgeNotFoundError`        | 引用了不相邻节点之间的边                       |
| `WasmError`                | WASM 函数的无效输入（如 Dijkstra 使用负权重）  |
| `WasmNotInitializedError`  | 在任何异步算法调用之前调用了 `getWasmSync()`   |
