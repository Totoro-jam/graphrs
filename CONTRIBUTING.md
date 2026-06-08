# Contributing to @graphrs

## Getting Started

```bash
git clone git@github.com:Totoro-jam/graphrs.git
cd graphrs
pnpm install
pnpm turbo build
pnpm turbo test
```

## Development Workflow

1. Create a branch: `feat/<package>/<description>`
2. Make changes
3. Run checks: `pnpm turbo build && pnpm turbo test && pnpm turbo typecheck`
4. Format: `pnpm format`
5. Add changeset: `pnpm changeset` (for user-facing changes)
6. Open PR

## Commit Convention

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `test`, `docs`, `refactor`, `perf`, `chore`, `ci`
Scope: package name (`core`, `community`, ...) or `repo`

## Code Standards

- No `any` types in library code
- No `console.log` in library code
- All algorithm functions are `async`
- First argument is always `Graph`, second is optional typed options
- Every package has `"sideEffects": false`

## Adding a New Algorithm Binding

See the BWU (Binding Work Unit) process in [docs/SOP.md](docs/SOP.md).

## Questions?

Open an issue or check [docs/SOP.md](docs/SOP.md).
