# WASM 与许可

## 架构

graphrs 封装了 [rust-igraph](https://github.com/Totoro-jam/rust-igraph) —— [igraph](https://igraph.org/) 图算法库的 Rust 绑定 —— 编译为 WebAssembly。架构如下：

```
Your TypeScript code
  → @graphrs/* packages (MIT, TypeScript)
    → @graphrs/core WASM loader
      → igraph-wasm binary (GPL-2.0)
        → rust-igraph (igraph 的 Rust FFI 绑定)
```

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

// 首次调用触发 WASM 加载
const result = await pagerank(graph);
```

### 环境检测

`@graphrs/core` 自动检测运行时环境：

- **Node.js**：使用 `fs.readFile` 从磁盘读取 `.wasm` 文件
- **浏览器**：通过 URL 获取 `.wasm` 文件（相对于 JS bundle 的路径）

### 手动初始化

你可以通过以下方式检查 WASM 状态：

```typescript
import { isWasmInitialized, getWasmSync } from '@graphrs/core';

isWasmInitialized(); // 首次算法调用前为 false
getWasmSync(); // 初始化前为 null，之后为 WasmExports
```

### 打包配置

对于浏览器构建，确保你的打包工具将 `.wasm` 文件作为静态资源提供。大多数现代打包工具（Vite、webpack 5、Rollup）通过 `new URL(..., import.meta.url)` 自动处理。

#### Vite

开箱即用 —— Vite 原生支持 WASM 导入。

#### webpack 5

启用 `asyncWebAssembly` 实验特性：

```javascript
// webpack.config.js
module.exports = {
  experiments: {
    asyncWebAssembly: true,
  },
};
```

## 性能说明

- WASM 初始化耗时约 1-2ms（一次性开销）
- 算法执行以接近原生的速度运行
- 内存在 WASM 沙箱中自动管理
- 对于 Web Worker，导入 `@graphrs/core/worker` 以实现主线程外执行
