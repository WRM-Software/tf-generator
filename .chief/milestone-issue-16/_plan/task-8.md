# Task 8 — README (root) rewrite

## Goal

Rewrite the root `README.md` to describe direct Terraform generation instead of the
old CDKTF-backed pitch, per `_contract/package-exports.md`'s "README (root)" section.

## Contract reference

`_contract/package-exports.md` → "README (root)" section:
> Rewrite to describe direct Terraform generation. Remove "Backed by CDKTF" and the
> CDKTF-oriented feature list. Describe: author in TS → `emitJson` → plain `terraform`
> (note HCL emission as a planned follow-up, not shipped yet).

## Steps

1. Read `.chief/milestone-issue-16/_report/task-7-report.md` first — it has the exact
   run script name/command for the new `examples/azurerm-webapp` example. Reference
   that (not `examples/basic` or the old `make examples basic get`/`synth` CDKTF
   commands) in the "Run Examples" section.
2. Rewrite `README.md`:
   - Title/subtitle: drop "Backed by CDKTF" — describe it as authoring Terraform
     configuration in TypeScript, emitted directly as `.tf.json` (no CDKTF, no synth
     engine). Mention HCL emission (`emitHcl`) as a planned future addition, not
     available yet — don't imply it already works.
   - Remove the CDKTF-oriented "Features" list (Override Resource Type / Type-Safe
     framed around CDKTF stacks) — replace with whatever's actually true of the new
     API (the `TfBuilder` method set, `emitJson`, cross-resource `.attr()` refs).
   - "Starter Project" section links to `thaitype/terrakit-starter` — that's a CDKTF-era
     starter and is now stale/misleading. Use your judgment: either remove this
     section, or leave a note that it's not yet updated for the new core. Don't
     fabricate a new starter-project link that doesn't exist.
   - "Run Examples" section: update to reference `examples/azurerm-webapp` and its
     actual run command (from task-7's report), not the old CDKTF `get`/`synth` Makefile
     commands (those were CDKTF-specific — `cdktf-cli get`/`cdktf-cli synth` — and don't
     apply to the new example unless task 7 happened to reuse those names, which it
     shouldn't have).
   - "Clean all Examples built files" (`make clean-all` / `scripts/clean-examples.sh`)
     — check whether this script still makes sense given the new example's output
     location; leave it as-is if it's still generically correct, note in your report
     if it looks stale.

## Acceptance

- README no longer mentions "Backed by CDKTF" or CDKTF-oriented features.
- README's example-running instructions are accurate for `examples/azurerm-webapp` as
  it actually exists after task 7 (verify by reading task-7's actual files, not just
  its report, if anything is unclear).
- Commit once done — this is a docs-only change, but still run `bun run check` first
  per the verification rule (should be unaffected, but confirm).

## Out of scope

- `examples/azurerm-webapp`'s own README — already done in task 7.
- Fixing root `package.json`'s stale `get` script / `repository`/`homepage` — task 9.
