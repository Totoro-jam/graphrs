import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts','src/dijkstra.ts','src/bellman-ford.ts','src/bfs.ts','src/dfs.ts','src/all-pairs.ts'],
  format: ['esm'], dts: true, clean: true, sourcemap: true, target: 'es2022', splitting: true, treeshake: true,
});
