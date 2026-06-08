import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts','src/louvain.ts','src/leiden.ts','src/infomap.ts','src/label-propagation.ts','src/walktrap.ts','src/fast-greedy.ts','src/spinglass.ts','src/fluid.ts'],
  format: ['esm'], dts: true, clean: true, sourcemap: true, target: 'es2022', splitting: true, treeshake: true,
});
