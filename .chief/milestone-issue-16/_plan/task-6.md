# Task 6 — Unit tests (`vitest`)

## Goal

Cover `emitJson`'s behavior with `vitest`, satisfying success criterion 5 in
`_goal/_goal.md`. `vitest` and the `test`/`test:watch` scripts already exist
(added in task 1) — this task just writes the test files.

## Contract references

- `_goal/_goal.md` → success criterion 5 (exact list of what must be covered).
- `_contract/emitters.md` → encoding rules + document assembly your tests assert against.
- `_contract/core-types.md` → the "Dynamic blocks (no new primitive)" section, for the
  dynamic passthrough test case.
- `_contract/usage-examples.md` → examples 1 (minimal), 2 (flagship), 3 (repetition),
  4 (variables/ref), 5 (modules) are good sources for realistic test fixtures — you can
  build tests directly from these snippets since they're normative (the public API must
  make them compile and produce the shown output).

## Steps

Write test file(s) under `src/` (co-located `*.test.ts`, matching the existing
`tsconfig.build.json` exclude pattern for `src/**/*.test.ts` — e.g. `src/emitJson.test.ts`).
Cover, at minimum:

1. **Ref encoding** — a `Ref` value (e.g. via `tf.resource(...).attr("id")` or `ref(...)`)
   encodes to `"${expr}"` in the JSON output.
2. **`Block` no-op behavior** — a `block({...})`-wrapped body encodes identically to the
   same body passed without `block()` (object form), and an array-bodied `block([...])`
   encodes as an array of encoded objects.
3. **`dynamic`-block passthrough** — a body containing a `dynamic` key (per
   `core-types.md`'s pattern) passes through `emitJson` unchanged structurally (no
   special-case behavior, no dropped/mangled keys) — assert the exact nested shape
   survives, including a `Ref` inside `content`.
4. **`module()` wiring** — `tf.module(name, body)` returns an `Addressable`; calling
   `.attr(x)` on it produces `Ref("module.<name>.<x>")`, and it renders as `"${...}"`
   in the emitted JSON; also assert `body.source` (a local relative path string) comes
   through as a plain string value.
5. **Array/object nesting** — a body with nested arrays and objects (mix of primitives,
   refs, plain objects) encodes recursively and correctly.
6. **Full-program snapshot** — build a small multi-resource program (can mirror
   usage-examples.md example 2's shape) and assert the complete `emitJson` output
   against a snapshot (`toMatchSnapshot()` or an explicit expected-JSON string —
   your choice).

Don't test `TfBuilder`'s methods in isolation beyond what's needed to construct these
fixtures — the contract's unit-test scope is "asserting emitter output," not full
builder-API unit tests.

## Acceptance

- `bun run check` passes.
- `bun run test` (`vitest run`) passes, and actually covers all 6 items above — don't
  mark done with partial coverage.
- Commit once both are green.

## Out of scope

- Testing `emitHcl` — doesn't exist, fully deferred.
- Testing block-level `count`/`for_each`, `locals`, provider aliasing — all deferred,
  nothing to test.
- The `examples/azurerm-webapp` example itself — task 7.
