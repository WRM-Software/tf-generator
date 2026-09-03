# Task 2 — Block A: core value model & IR

## Goal

Implement the value-model substrate (`Ref`, `Block`, `TfValue`/`TfObject`/`TfPrimitive`,
internal `IR`, internal `Addressable`) that Block B (builder) and Block C (emitter) will
both operate on. New source files only — nothing wired into `src/index.ts` yet (that's
task 5).

## Contract reference

`_contract/core-types.md` (Block A) — this is the canonical, exact contract. Implement
it as written, including the "Dynamic blocks (no new primitive)" section (that section
is documentation of an *authoring pattern*, not a new class to implement — confirm you
haven't added a `Dynamic` class; there isn't one in the contract).

## Steps

1. Create the markers: `Ref` (+ `ref()` factory) and `Block` (+ `block()` factory), per
   the "Markers" section. Both use `instanceof` for detection, `_tag` retained only as
   a discriminant field, not the detection mechanism.
2. Create the value-model types: `TfPrimitive`, `TfValue`, `TfObject`, per the "Value
   model" section.
3. Create the internal `IR` type (`NamedBlock`, `LabelBlock`, and the `IR` interface
   itself with `terraform?`, `provider`, `resource`, `data`, `variable`, `output`,
   `module` arrays) per the "IR" section. This is internal — do not export it from
   `src/index.ts` (task 5 enforces the export boundary; for this task, just don't put
   it in a path that task 5 would export by pattern).
4. Create the internal `Addressable` class (`.address`, `.attr(path)` → `new
   Ref(\`${address}.${path}\`)`) per the "Addressable" section. `data` addresses are
   prefixed `data.`; `module` addresses are `module.<name>` (attr wiring is Block B's
   job when it constructs `Addressable` instances — this task just implements the
   class itself).
5. File layout is your choice (the contract doesn't mandate one) — reasonable default:
   `src/Ref.ts`, `src/Block.ts` (or a combined `src/markers.ts`), `src/ir.ts` (internal
   IR type), `src/Addressable.ts`. Keep names/paths sensible; task 5 will need to
   import from wherever you put the public ones (`Ref`, `Block`, `ref`, `block`).

## Acceptance

- `bun run check` passes (per `.chief/_rules/_verification/build-and-test.md`). Since
  nothing is wired into `index.ts` yet, this just means your new files individually
  typecheck cleanly under `strict`.
- `Ref`/`Block`/`ref`/`block` match the contract's exact shape (constructor args,
  `toString()` on `Ref`, `_tag` values).
- `IR` and `Addressable` are not reachable from `src/index.ts` (they aren't wired to
  anything yet in this task anyway, so this should be automatic).
- Commit once `bun run check` is green.

## Out of scope

- Builder API (`TfBuilder` class) — task 3.
- Emitters — task 4.
- Wiring anything into `src/index.ts` — task 5.
- `emitHcl`-related concerns (HCL block-vs-attribute rendering) — deferred this
  milestone; `Block` only needs to exist as a marker + hold its body, no HCL logic.
