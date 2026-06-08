import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts','src/max-flow.ts','src/min-cut.ts','src/connectivity.ts'],
  format: ['esm'], dts: true, clean: true, sourcemap: true, target: 'es2022', splitting: true, treeshake: true,
});
