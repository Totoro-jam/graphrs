---
name: grill
description: "Stress-test an API design or architectural decision by relentlessly interrogating it against CLAUDE.md constraints, SOP.md standards, and TypeScript best practices — one question at a time. Use when: 'grill me', 'challenge this design', 'is this API right?', before committing to a public API or package boundary change."
---

# Grill

A hostile-questioning interview about a design decision. Walks down the
decision tree one branch at a time, resolving conflicts before code lands.

> Adapted from <https://github.com/mattpocock/skills/tree/main/skills/engineering/grill-with-docs>.
> Substitutes @graphrs docs for the original's CONTEXT.md.

## When to use

Before locking in:
- A new package's public API
- A change to `@graphrs/core` types that affects all packages
- A WASM marshalling strategy (SharedArrayBuffer vs JSON vs typed arrays)
- A bundle-size decision (split WASM? feature flags?)
- Any choice that would be painful to reverse after publish

## Where to find existing decisions

Before asking, read what's already settled:

1. **`CLAUDE.md`** — hard constraints (no any, async always, Graph first)
2. **`docs/SOP.md`** — process rules (BWU steps, PR checklist)
3. **`docs/plans/GRAPHRS_NPM_PLAN.md`** — the architecture plan
4. **`docs/plans/GRAPHRS_NPM_PLAN_SUPPLEMENT.md`** — gaps and additions
5. **`docs/tracking/BINDINGS.md`** — current binding status

## How the grill works

For each branch in the design tree:

1. **Restate the decision** — one sentence
2. **Quote relevant constraints** — CLAUDE.md rules, SOP items, plan sections
3. **Offer 2-3 options** with trade-offs. Bias toward a recommendation
4. **Ask** one specific yes/no or pick-one question
5. **Wait for the user's answer.** Do not chain questions.

## Example

> Decision: should `@graphrs/layout` return `Float64Array` or `[number, number][]`?
>
> Constraints:
> - CLAUDE.md says all results are typed objects with named fields
> - Plan says LayoutResult = `{ positions: [number, number][] }`
> - WASM naturally returns Float64Array (zero-copy from linear memory)
>
> Options:
> 1. `[number, number][]` — matches plan, ergonomic, but copies data
> 2. `Float64Array` — zero-copy, but loses tuple typing, users must index
> 3. Both: `{ positions: [number, number][], raw: Float64Array }` — flexible but heavy
>
> Recommended: **1 ([number, number][])** for v0.1 — matches plan, type-safe,
> perf-optimize later if benchmarks show the copy matters. The copy for 50k
> nodes is ~1ms; the WASM computation is ~2500ms.
>
> Question: accept tuple arrays for v0.1, or do you want zero-copy now?

## When to stop

- The user says "OK, ship that"
- Every leaf has a one-sentence decision
- A question is answerable by reading code — go read it, come back with answers

## Anti-patterns

- **Don't ask open-ended questions.** Always offer the recommended default.
- **Don't chain questions.** One at a time.
- **Don't re-litigate CLAUDE.md constraints.** They're settled.
- **Don't grill trivial naming choices.** Just pick and move on.
