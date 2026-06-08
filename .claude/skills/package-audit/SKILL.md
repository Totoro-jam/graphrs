---
name: package-audit
description: "Audit a package for TypeScript, ESM, and npm best practices. Checks package.json fields, exports, types, bundle size, tree-shaking, and compatibility. Use when: 'audit this package', 'check package health', 'is this publishable?', or before first npm publish."
---

# /package-audit [package-name | all]

Comprehensive audit of npm package quality, TypeScript strictness, and
ESM compatibility.

## Checks performed

### 1. package.json correctness

- [ ] `"type": "module"` is set
- [ ] `"sideEffects": false` is set
- [ ] `"exports"` field has `types` condition before `import`
  (TypeScript requires types-first for proper resolution)
- [ ] `"files"` field includes only dist + wasm (no src, no tests)
- [ ] `"license": "MIT"` is set
- [ ] `"engines": { "node": ">=18.0.0" }` is set
- [ ] `"peerDependencies"` lists `@graphrs/core` (for non-core packages)
- [ ] Every subpath in `"exports"` has a corresponding source file
- [ ] No `"main"` pointing to src (should point to dist)

### 2. TypeScript strictness

- [ ] `tsconfig.json` extends `../../tsconfig.base.json`
- [ ] `"strict": true` is inherited
- [ ] No `// @ts-ignore` or `// @ts-expect-error` without justification
- [ ] No `any` in exported function signatures
- [ ] No `as any` or `as unknown as X` in library code
- [ ] All public functions have JSDoc `@param` and `@returns`
- [ ] `type` keyword used for type-only imports

### 3. ESM compatibility

- [ ] All internal imports use `.js` extension
- [ ] No `require()` calls
- [ ] No `__dirname` / `__filename` (use `import.meta.url`)
- [ ] No `module.exports`
- [ ] `import.meta.url` used for WASM/asset loading

### 4. Tree-shaking readiness

- [ ] No top-level side effects (no code at module scope besides exports)
- [ ] No barrel re-exports of entire modules (`export * from`)
- [ ] Each algorithm is independently importable via subpath

### 5. Bundle size

- [ ] JS output < 5KB gzipped (per algorithm package)
- [ ] No accidentally bundled dependencies
- [ ] No duplicate type definitions

### 6. API consistency (per CLAUDE.md)

- [ ] All algorithm functions are `async`
- [ ] First arg is `Graph`, second is optional typed options
- [ ] Result types are typed objects (not raw arrays/primitives)
- [ ] Errors use `GraphError` with code + message
- [ ] Options interfaces named `<Algorithm>Options`

## Output format

```
## Package Audit: @graphrs/<name>

### PASS (N items)
- ✓ type: module
- ✓ sideEffects: false
...

### FAIL (N items)
- ✗ Missing JSDoc on `louvain()` — add @param and @returns
- ✗ `as any` cast in graph.ts:42 — replace with proper type
...

### WARN (N items)
- ⚠ No tests yet — add before publish
...

### Score: N/M checks passed
```

## References

- [Are the types wrong?](https://arethetypeswrong.github.io/) — the
  gold standard for checking TS package compatibility
- [publint](https://publint.dev/) — lint package.json for npm publishing
- TypeScript handbook: [Publishing](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)
- Node.js docs: [Packages](https://nodejs.org/api/packages.html#exports)
