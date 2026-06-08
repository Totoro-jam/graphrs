---
name: diagnose
description: "Debug build, test, or WASM loading issues. Use when something is broken and you need to investigate."
---

# /diagnose

General-purpose debugging skill. Adapted from rust-igraph /diagnose.

## Workflow

1. **Identify the symptom**: What exactly fails? Build? Test? Runtime?
2. **Reproduce**: Run the failing command, capture full output
3. **Narrow scope**: Which package? Which file? Which line?
4. **Check common causes**:
   - WASM not built → `ls packages/core/wasm/*.wasm`
   - Import path wrong → check `.js` extension in imports
   - Type mismatch → `pnpm turbo typecheck` output
   - Missing export → check `package.json` exports field
   - Circular dependency → check import graph
5. **Fix or escalate**: Fix if clear, ask user if architectural
