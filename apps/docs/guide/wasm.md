# WASM & Licensing

## Architecture

graphrs wraps [igraph](https://igraph.org/) — a mature C library with 400+ graph algorithms — compiled to WebAssembly via Rust. The architecture looks like this:

```
Your TypeScript code
  → @graphrs/* packages (MIT)
    → @graphrs/core WASM loader
      → igraph-wasm binary (GPL-2.0)
        → igraph C library (compiled to WASM)
```

## Licensing

graphrs uses a **dual license** model:

| Component | License | What it means |
|-----------|---------|---------------|
| TypeScript packages (`@graphrs/*`) | **MIT** | Use freely in any project |
| WASM binary (`igraph_wasm_bg.wasm`) | **GPL-2.0** | Copyleft applies to the binary |

The GPL-2.0 license on the WASM binary means:

- The `.wasm` file itself is GPL-2.0 (because it links igraph, which is GPL-2.0)
- Your TypeScript code that *calls* the WASM functions is **not** subject to GPL
- You do **not** need to open-source your application
- If you modify and redistribute the WASM binary itself, GPL-2.0 applies

The standalone WASM package is published as [`@graphrs/igraph-wasm`](https://www.npmjs.com/package/@graphrs/igraph-wasm).

## WASM Loading

The WASM module loads automatically on first algorithm call:

```typescript
import { pagerank } from '@graphrs/centrality';

// First call triggers WASM load
const result = await pagerank(graph);
```

### Environment Detection

`@graphrs/core` automatically detects the runtime environment:

- **Node.js**: Reads the `.wasm` file from disk using `fs.readFile`
- **Browser**: Fetches the `.wasm` file via URL (relative to the JS bundle)

### Manual Initialization

You can check WASM status with:

```typescript
import { isWasmInitialized, getWasmSync } from '@graphrs/core';

isWasmInitialized(); // false before first algorithm call
getWasmSync();       // null before init, WasmExports after
```

### Bundle Configuration

For browser builds, ensure your bundler serves the `.wasm` file as a static asset. Most modern bundlers (Vite, webpack 5, Rollup) handle this automatically via `new URL(..., import.meta.url)`.

#### Vite

Works out of the box — Vite natively supports WASM imports.

#### webpack 5

Enable the `asyncWebAssembly` experiment:

```javascript
// webpack.config.js
module.exports = {
  experiments: {
    asyncWebAssembly: true,
  },
};
```

## Performance Notes

- WASM initialization takes ~1-2ms (one-time cost)
- Algorithm execution runs at near-native speed
- Memory is managed automatically within the WASM sandbox
- For Web Workers, import `@graphrs/core/worker` for off-main-thread execution
