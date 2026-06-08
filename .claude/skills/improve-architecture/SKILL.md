---
name: improve-architecture
description: "Find 'deepening opportunities' in the codebase — places where the architecture can be improved by better abstractions, reduced duplication, or domain-aligned boundaries. Use when: 'review the architecture', 'is there tech debt?', 'where can we improve?', or after a batch of BWUs lands."
---

# /improve-architecture [scope]

Systematically review the codebase for architectural improvements.
Scope can be a package name, 'all', or a specific concern.

> Adapted from <https://github.com/mattpocock/skills/tree/main/skills/engineering/improve-codebase-architecture>.
> Applied to TypeScript monorepo with WASM bindings.

## What this skill does

Scan the specified scope for "deepening opportunities" — places where:

1. **Shallow modules** exist (wide interface, thin implementation)
2. **Duplicated marshalling patterns** could be extracted
3. **Type safety gaps** exist (`any`, unsafe casts, missing generics)
4. **Package boundaries** are wrong (cross-package imports that suggest
   a function belongs elsewhere)
5. **API inconsistencies** between packages (options naming, return types)

## Process

### 1. Survey

Read every `src/index.ts` + 2-3 implementation files per package in scope.
Note the patterns.

### 2. Categorize findings

Group into:

| Category | Example |
|----------|---------|
| **Extract** | 5 packages repeat the same WASM marshalling boilerplate |
| **Deepen** | A function has 8 parameters; should be an options object |
| **Move** | `subgraph()` is in operators but used by core internally |
| **Type** | Return type is `any` where it should be typed |
| **Rename** | Inconsistent naming (`options` vs `opts` vs `config`) |
| **Delete** | Dead code, unused exports |

### 3. Prioritize

Rate each finding:
- **Impact**: How many files/users does this affect?
- **Effort**: How hard is the fix?
- **Risk**: Does this change a public API?

### 4. Report

Present findings as a ranked list. For each:
- What to change (one sentence)
- Why (the deepening opportunity)
- Where (file paths)
- Effort estimate (S/M/L)

Do NOT make changes. This skill reports; the user decides.

## What to look for (TypeScript-specific)

### Type Safety
- `as unknown as X` casts — do we actually need them?
- `Record<string, unknown>` where a specific interface exists
- Missing generic constraints on Graph<N, E>
- `any` in function signatures or return types

### ESM/Package Health
- Missing subpath exports in package.json
- `sideEffects` not set to false
- Circular imports between packages
- `@graphrs/core` types not re-exported where needed

### WASM Integration
- Duplicated `getWasm() + _getEdgePairs() + void` boilerplate
- Missing error wrapping (raw WASM errors should become GraphError)
- Inconsistent options → WASM parameter mapping

### API Consistency
- All options interfaces follow `<Algorithm>Options` naming
- All result types follow `<Domain>Result` naming
- All functions: async, Graph first, options second
- No positional args beyond Graph + explicit required params

## Anti-patterns

- **Don't refactor while reviewing.** Report, don't fix.
- **Don't suggest abstractions for < 3 instances.** Three similar lines
  is better than a premature abstraction.
- **Don't suggest changes that break public API** without flagging it as
  a breaking change.
