# WASM & Licensing

## Architecture

graphrs wraps [rust-igraph](https://github.com/Totoro-jam/rust-igraph) — Rust bindings to the [igraph](https://igraph.org/) graph library — compiled to WebAssembly. The architecture looks like this:

```
Your TypeScript code
  → @graphrs/* packages (MIT, TypeScript)
    → @graphrs/core WASM loader
      → igraph-wasm binary (GPL-2.0, ~2.3 MB)
        → rust-igraph (Rust FFI bindings to igraph)
```

The WASM binary contains the compiled C/Rust code for all 400+ igraph algorithms. It loads once and is shared across all `@graphrs/*` packages.

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

// First call triggers WASM load (~1-2ms)
const result = await pagerank(graph);

// Subsequent calls — WASM is cached, runs immediately
const result2 = await pagerank(anotherGraph);
```

### Environment Detection

`@graphrs/core` automatically detects the runtime environment:

- **Node.js**: Reads the `.wasm` file from disk using `fs.readFile`
- **Browser**: Fetches the `.wasm` file via URL (uses `new URL(..., import.meta.url)`)

No manual configuration is needed — it works out of the box in both environments.

### Checking WASM Status

You can check WASM status programmatically:

```typescript
import { isWasmInitialized, getWasmSync } from '@graphrs/core';

isWasmInitialized(); // false before first algorithm call
getWasmSync();       // null before init, WasmExports after
```

### Data Flow

When you call an algorithm function, data flows through these steps:

```
1. Your Graph object (TypeScript)
2. → Edge pairs serialized to Uint32Array
3. → WasmGraph.fromEdges() creates a graph in WASM memory
4. → Algorithm runs at native speed in WASM sandbox
5. → Result serialized as JSON string
6. → JSON.parse() back to typed TypeScript object
7. → WASM graph freed (wg.free())
```

All of this happens automatically inside each algorithm function.

## Bundle Configuration

### Vite

Works out of the box — Vite natively supports WASM imports.

### webpack 5

Enable the `asyncWebAssembly` experiment:

```javascript
// webpack.config.js
module.exports = {
  experiments: {
    asyncWebAssembly: true,
  },
};
```

### Next.js

For Next.js with webpack:

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

Use [`@rollup/plugin-wasm`](https://github.com/nicolo-ribaudo/rollup-plugin-wasm):

```javascript
import { wasm } from '@rollup/plugin-wasm';

export default {
  plugins: [wasm()],
};
```

## Performance

| Metric | Value |
|--------|-------|
| WASM binary size | ~2.3 MB (uncompressed), ~800 KB gzipped |
| Initialization | ~1-2 ms (one-time) |
| Algorithm execution | Near-native speed (10-100x faster than pure JS) |
| Memory management | Automatic within WASM sandbox |

### Performance Tips

- **Parallel algorithms**: Use `Promise.all()` to run independent algorithms concurrently. The WASM module handles this correctly.
- **Large graphs**: For graphs with >100k nodes, prefer `layoutDRL` over `layoutFR`, and `labelPropagation` over `louvain`.
- **Repeated analysis**: The `Graph` object is pure TypeScript — WASM is only invoked when you call an algorithm function. Creating and manipulating graphs is instant.

## Error Handling

WASM errors are caught and re-thrown as typed TypeScript errors:

```typescript
import { GraphError, WasmError } from '@graphrs/core';

try {
  const result = await pagerank(graph);
} catch (e) {
  if (e instanceof WasmError) {
    // Error from inside the WASM binary
    console.error('WASM error:', e.message);
  } else if (e instanceof GraphError) {
    // Error from the TypeScript wrapper
    console.error('Graph error:', e.message);
  }
}
```

Common errors:

| Error | Cause |
|-------|-------|
| `NodeNotFoundError` | Referencing a node ID that doesn't exist |
| `EdgeNotFoundError` | Referencing an edge between non-adjacent nodes |
| `WasmError` | Invalid input to the WASM function (e.g., negative weights for Dijkstra) |
| `WasmNotInitializedError` | Calling `getWasmSync()` before any async algorithm call |
