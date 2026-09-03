# Task task-8 Report

## Task
Rewrite the root `README.md` to describe direct Terraform generation
(`TfBuilder` -> `emitJson` -> plain `terraform`) instead of the old
CDKTF-backed pitch, per `_contract/package-exports.md`'s "README (root)"
section.

## Outcome
done

## Notes
- **Title/subtitle:** dropped "Backed by CDKTF" entirely. New intro describes
  authoring in TypeScript and emitting `.tf.json` directly, no CDKTF/synth
  engine/`constructs`. Called out `emitHcl` explicitly as a planned follow-up,
  not shipped this milestone (per contract instruction not to imply it works).
- **Features list:** replaced the CDKTF-framed "Override Resource Type /
  Type-Safe" bullets with a description of what's actually true of the new
  API today, verified against `src/index.ts`, `src/TfBuilder.ts`,
  `src/Addressable.ts`, and `src/markers.ts`: the `TfBuilder` method set
  (`terraform`/`provider`/`resource`/`data`/`variable`/`output`/`module`),
  `.attr(path)` cross-resource references, `block(...)`, `ref(...)`, and
  `emitJson(tf)`. Included a short code snippet (provider -> resource group ->
  service plan, `.attr()` wiring) adapted from
  `examples/azurerm-webapp/src/main.ts`.
- **Starter Project:** the link to `thaitype/terrakit-starter` is CDKTF-era
  and doesn't apply to the new core. Per the task's judgment call, I did not
  fabricate a new starter link (none exists) — I kept the section heading but
  replaced the content with a note that no starter project exists yet for
  this core, and pointed readers at `examples/azurerm-webapp` as the
  complete, runnable example in the meantime.
- **Run Examples:** rewritten to reference `examples/azurerm-webapp` and the
  exact command sequence from task-7's report/README: `bun run build` (repo
  root, since the example depends on `@wrmsoftware/tf-generator` via
  `file:../..` and its `main`/`module`/`types` point at `dist/`), then
  `cd examples/azurerm-webapp && bun install && bun run start`. Removed the
  old `make examples basic get` / `make examples basic synth` CDKTF-cli
  commands entirely (they don't apply — no `examples/basic` directory
  exists anymore per this milestone's contract deletions, and the new
  example's `package.json` has no `cdktf`/`get`/`synth` scripts).
- **Clean all Examples built files:** left `make clean-all` /
  `scripts/clean-examples.sh` invocation unchanged in the README, per the
  task's "leave as-is if still generically correct" option. However, I did
  check the actual script (`scripts/clean-examples.sh`): it only removes
  `examples/**/.gen`, `examples/**/node_modules`, and `examples/**/cdktf.out`
  — the first and third patterns are CDKTF-era artifacts that no longer apply
  to `examples/azurerm-webapp` (which instead writes to `examples/azurerm-
  webapp/out/`, not covered by any of the three globs). The script isn't
  wrong/broken (it just won't clean anything for the new example beyond
  `node_modules`), but it is stale. I did not touch the script itself since
  it's a separate file outside this task's scope (README.md only) and no
  task references updating it — flagging here for chief-agent to decide
  whether it warrants a follow-up task.
- Did not touch `package.json` (task 9's scope, per explicit instruction) or
  `examples/azurerm-webapp/README.md` (task 7's, out of scope per this task
  spec).

## Verification
- `bun run check` (root, `tsc -b tsconfig.json`) passes with no output/errors
  — unaffected by the docs-only change, as expected.
- Diff scoped to `README.md` only; committed as `e68740c`.
