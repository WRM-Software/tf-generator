# Task 5 — Public surface: `src/index.ts` exports

## Goal

Replace the placeholder `src/index.ts` (from task 1) with the real public export
surface, and get the whole package into a genuinely working, correctly-scoped state.
Depends on tasks 2, 3, and 4 all being done.

## Contract reference

`_contract/package-exports.md` → "`src/index.ts` exports (exact set)" section.

## Steps

1. `src/index.ts` must export **exactly**:
   - `TfBuilder` (the class, from task 3)
   - `Ref`, `ref` (from task 2)
   - `Block`, `block` (from task 2)
   - `emitJson` (from task 4)
   - `TfPrimitive`, `TfValue`, `TfObject` as types (from task 2)
2. Must **NOT** export: `IR` (or its `NamedBlock`/`LabelBlock` helpers), `Addressable`.
   Double-check neither is reachable via a re-export chain from `index.ts`.
3. This is the exact set — no extra convenience exports, no forgotten ones.

## Acceptance

- `bun run check` passes with the real exports in place (not the task-1 placeholder).
- Manually verify (read the compiled export list, or write a throwaway scratch import
  and delete it after) that all 9 required names are exported and neither `IR` nor
  `Addressable` is.
- This task effectively completes success criterion 6 in `_goal/_goal.md` — cross-check
  against it directly before marking done.
- Commit once `bun run check` is green.

## Out of scope

- Writing usage examples / the `examples/azurerm-webapp` example — a later batch.
- Writing unit tests — a later batch (vitest is already a devDependency from task 1,
  but wiring actual test files is separate work).
- README rewrite — a later batch.
