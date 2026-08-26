# Task task-2 Report

## Task

Implement Block A (core value model & IR): `Ref`/`Block` markers, `TfValue`/`TfObject`/
`TfPrimitive`, internal `IR`, and internal `Addressable`, per
`_contract/core-types.md`. New source files only, nothing wired into `src/index.ts`.

## Outcome

done

## Notes

File layout chosen (all new, none imported by `src/index.ts` yet — that's task 5):

- `src/values.ts` — `TfPrimitive`, `TfValue`, `TfObject` (the value model). Imports
  `Ref`/`Block` as `import type` from `./markers.js` (type-only, so no runtime
  circularity with `markers.ts`).
- `src/markers.ts` — public markers: `Ref`, `ref()`, `Block`, `block()`. Imports
  `TfObject` as `import type` from `./values.js` for `Block`'s constructor param.
  These are the two names task 3/5 will import: `Ref`, `Block`, `ref`, `block` all
  live here.
- `src/ir.ts` — internal `NamedBlock`, `LabelBlock`, `IR` interface. Imports `TfObject`
  type-only from `./values.js`. Not exported from `index.ts`.
- `src/Addressable.ts` — internal `Addressable` class (`.address`, `.attr(path)` →
  `new Ref(...)`). Imports `Ref` (value, not type-only) from `./markers.js`. Not
  exported from `index.ts`.

Design notes for whoever builds Block B (`TfBuilder`, task 3):

- Import the public surface from `./markers.js` (`Ref`, `ref`, `Block`, `block`) and
  the value types from `./values.js` (`TfValue`, `TfObject`, `TfPrimitive`).
- Import the internal IR shape from `./ir.js` (`IR`, `NamedBlock`, `LabelBlock`) and
  the internal handle from `./Addressable.js` (`Addressable`).
- `Addressable` itself does no address-prefixing (e.g. `data.` or `module.`) — per
  the task spec, that's Block B's job when it constructs `Addressable` instances
  (pass the already-prefixed address string into the constructor).
- Relative imports use explicit `.js` extensions per the repo's `nodenext`
  module/moduleResolution config combined with `verbatimModuleSyntax: true` — match
  this convention in task 3's new files, and use `import type` for type-only imports.
- No `instanceof` detection logic was added anywhere in this task (that's Block C's
  job in the emitter) — `_tag` fields exist purely as discriminants, as the contract
  specifies.
- Verified `tsc --listFiles` picks up all four new files under the existing
  `tsconfig.json` (no `include`/`files` override needed) and `bun run check` passes
  clean.
