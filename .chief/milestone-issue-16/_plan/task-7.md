# Task 7 — `examples/azurerm-webapp` (the flagship example)

## Goal

Create the one required example this milestone, satisfying success criterion 4 in
`_goal/_goal.md` and the "New example" section of `_contract/package-exports.md`.

## Contract references

- `_contract/package-exports.md` → "New example" section (path, contents, package.json
  constraints, README requirement).
- `_contract/usage-examples.md` → example 2 (the flagship snippet — reproduce this
  program, don't invent a different resource wiring) and example 5 (modules — NOT
  required in this example; module usage is validated by task 6's unit test instead,
  per `_plan/_todo.md`'s note — don't add a module call here unless you want to, but
  it's not required).
- `_goal/_goal.md` → success criterion 4 (what the example must satisfy once run).

## Context: local package resolution

This package (`@wrmsoftware/tf-generator`) is NOT published to npm — this whole
milestone is pre-release work on a feature branch. The example's `package.json` still
needs to declare a dependency on `@wrmsoftware/tf-generator` (per the contract), but it
must resolve **locally** to this repo's own `src/` (via the built `dist/`, or directly
via a local path). The standard, low-risk way to do this with Bun is a `file:` (or
`link:`) protocol dependency pointing at the repo root, e.g.
`"@wrmsoftware/tf-generator": "file:../.."` from `examples/azurerm-webapp/`. Use your
judgment on the exact mechanism (`file:` vs `link:` vs `workspace:` if you decide the
repo should become a Bun workspace) — pick whichever is simplest and actually works when
you test it; don't turn this into a bigger restructuring than needed. Note whatever you
picked in your task report.

## Steps

1. Create `examples/azurerm-webapp/` with:
   - `package.json` — `"private": true` (not published), depends only on
     `@wrmsoftware/tf-generator` (resolved per above) plus Bun types
     (`@types/bun` devDependency) — **no `cdktf`, no `constructs`**. Include a script
     to run the example (your naming choice, e.g. `"start"` or `"build"` — whatever you
     use, document it in the README per the next bullet).
   - `src/main.ts` (or similar) — reproduces usage-examples.md example 2's program
     (resource group → service plan → linux web app, wired via `.attr()`), then writes
     the emitted JSON to a file (e.g. `out/main.tf.json`), matching example 5 in
     `_contract/usage-examples.md`'s "Emitting to files" pattern (`Bun.write`).
   - `README.md` — documents running the example and the `emit → terraform validate`
     workflow (no `terraform fmt` step — that's HCL-only and out of scope this
     milestone, per `_contract/package-exports.md`).
2. Actually run the example (`bun install` inside the example dir, then your run
   script) and confirm it writes valid-looking `.tf.json`.
3. If `terraform` CLI is available in your environment, run `terraform validate`
   against the output directory and note the result in your report. If it's not
   available, note that too — don't treat it as a blocker for this task (per
   `_goal/_goal.md`'s Escalation section, an unverifiable `terraform validate` is
   flagged, not silently skipped, but it doesn't block finishing this task's own
   acceptance criteria below).

## Acceptance

- `bun run check` (root) still passes — the new example dir shouldn't break the root
  typecheck (check `tsconfig.build.json`'s excludes already cover `examples/`).
- The example actually runs and produces `.tf.json` output when you execute it.
- `package.json` has no `cdktf`/`constructs`.
- README documents the workflow.
- Commit once verified.

## Out of scope

- A second example for modules — not required (see Contract references above).
- Fixing the root `package.json`'s stale `get` script or `repository`/`homepage` URLs —
  task 9.
- README (root) rewrite — task 8.
