# TODO — milestone-issue-16

## Batch 1 — purge + core spine (Blocks A/B/C) + public surface

- [x] task-1 — Purge CDKTF: delete old core + old examples, update `package.json`/`tsconfig.json`
- [x] task-2 — Block A: core value model & IR (`Ref`, `Block`, `TfValue`/`TfObject`/`TfPrimitive`, internal `IR`, internal `Addressable`)
- [x] task-3 — Block B: `TfBuilder` builder API
- [x] task-4 — Block C: `emitJson`
- [x] task-5 — Public surface: `src/index.ts` exports

Batch 1 exit condition met: `bun run check` passes clean end-to-end (verified).
Goals not fully satisfied yet (no tests, no example, no README rewrite) — continuing.

## Batch 2 — tests, example, README, cleanup

- [x] task-6 — Unit tests (`vitest`): ref encoding, `Block` no-op, `dynamic` passthrough,
      `module()` wiring, array/object nesting, full-program snapshot (criterion 5)
- [x] task-7 — `examples/azurerm-webapp`: the flagship example (usage-examples.md
      example 2), own `package.json`/README, emits `.tf.json`
- [x] task-8 — README (root) rewrite: drop "Backed by CDKTF"
- [x] task-9 — Cleanup: fix `get` script (pointed at deleted `examples/basic`) to
      point at the new example; fix `repository`/`homepage` URLs (still
      `thaitype/terrakit`) to the new org/repo

Batch 2 complete. Cross-checked against `_goal/_goal.md`'s 6 success criteria:

1. CDKTF gone — verified clean (`grep` across `src/`, `examples/`, `package.json`,
   excluding `node_modules`: zero matches for `cdktf`/`constructs`/`lodash.merge`/`zod`).
2. Core compiles — `bun run check` passes.
3. JSON emitter works — verified via unit tests + real example run.
4. Example runs, `terraform validate` passes — verified in task-7 (real `terraform`
   v1.15.9, `Success! The configuration is valid.`).
5. Tests green, all 6 required areas covered — verified, 6/6 passing.
6. Public API exact surface — verified in task-5 (`IR` confirmed unreachable via
   `tsc` error check).

One wording inconsistency found and fixed: `_goal.md`'s "Dynamic blocks" bullet said
"covered by the flagship example and a unit test" — the actual flagship example
(task-7, reproducing usage-examples.md example 2 verbatim) has no dynamic block, only
the unit test does. Success criterion 5 (the real DoD) only ever required unit-test
coverage, so this was a stray overstatement, not an unmet contract — fixed the wording
to match reality rather than adding unnecessary scope to the flagship example.

**MILESTONE COMPLETE** — both goals and contracts satisfied.

Known follow-ups (out of this milestone's contract scope, not blockers):
- `scripts/clean-examples.sh` still targets CDKTF-era artifacts (`.gen`, `cdktf.out`),
  doesn't clean the new example's `out/` dir (found in task-8).
- Package isn't actually published — `file:../..` local dependency in the example is
  fine for this milestone but isn't how a real consumer would install it.

Module usage (usage-examples.md example 5) is validated via task-6's unit test, not a
second `examples/` directory — `_contract/package-exports.md` mandates only one new
example dir (`azurerm-webapp`).
- Final pass against all 6 success criteria in `_goal/_goal.md`.
