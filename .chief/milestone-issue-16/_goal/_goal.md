# Goal — milestone-issue-16: Terraform Generation Core (drop CDKTF)

**Issue:** #16 — "Ignore CDKTF, moving to Terraform Generation"
**Shaped spec:** `draft/terrakit-spec.md` (Blocks A + B + C of the A–E end-goal)

---

## Outcome

Replace the deprecated CDKTF-backed implementation with a **self-contained untyped
core** that authors Terraform configuration in TypeScript and emits it directly as
`.tf.json`. No CDKTF, no constructs, no synth engine.

This milestone delivers the **A → B → C spine** end-to-end (value model/IR → builder →
emitters), proven by one real example and a unit-tested emitter. The typed facade
(Block D) and broader example migration (Block E) are explicitly **out of scope** and
land in later milestones.

## Preflight (before starting this milestone's loop)

Run these once before delegating any tasks — don't assume they work. Verified
2026-08-26:

- **`terraform` CLI availability:** `terraform version` → **OK**, v1.15.9 installed
  at `~/.local/bin/terraform` (official HashiCorp release, checksum-verified). Also
  confirmed reachable: `registry.terraform.io` (provider downloads for `terraform
  init`) and `releases.hashicorp.com`. Required for success criterion 4 — if this
  binary goes missing later, re-verify before assuming criterion 4 is checkable.
- **Git push access:** this host has multiple `gh` accounts configured and the
  default active one lacks access to this org; confirmed push reaches
  `WRM-Software/tf-generator` under an account that does have access, via a dry-run
  push (`git push --dry-run` with an explicit token header) → **OK**. Don't rely on
  plain `git push` or `gh auth status` alone — the credential helper can silently
  pick the wrong account even after switching the active `gh` account.
- **`bun` availability:** `bun --version` → **OK**, 1.3.14.

## In scope

- **Block A — Core value model & IR:** `Ref`, `Block`, `TfValue`/`TfObject`/`TfPrimitive`,
  the internal `IR`, and the internal `Addressable` handle (`.address`, `.attr(path)`).
- **Block B — Builder API:** `TfBuilder` with the full method set — `terraform`,
  `provider`, `resource`, `data`, `variable`, `output`, `module`.
- **Block C — Emitters:** `emitJson` (structural), reading the IR. `emitHcl` is
  deferred (see Out of scope) — JSON alone is valid, production-usable Terraform config.
- **Dynamic blocks:** authored directly via a `dynamic` key in any body `TfObject` — no
  new value-model primitive needed, since Terraform's own JSON syntax already treats
  `dynamic` as literal structure (`{ dynamic: { <blockName>: { for_each, content,
  iterator? } } }`). Covered by the flagship example and a unit test. **Note:** the
  `for_each` here is `dynamic`'s own — it drives repeated nested attribute blocks
  *within one already-existing resource/data/module instance*. That is a different
  mechanism from the block-level `for_each` deferred below, which is Terraform
  creating multiple *instances* of a resource/data/module block. Same keyword, two
  unrelated features — only the block-level one is out of scope.
- **One example:** `azurerm` multi-resource wiring (resource group → service plan →
  linux web app), authored with the untyped core, emitting JSON, demonstrating
  cross-resource references. `module()` usage (local-path `source`, wiring inputs/
  outputs) is covered by a separate, dedicated contract example rather than folded
  into this one (see usage-examples.md example 5) — still required, just not crammed
  into the flagship snippet.
- **Unit tests:** `vitest`, asserting emitter output (snapshots + targeted cases).
- **Full CDKTF purge:** delete old `src/` and all three old examples; remove
  `cdktf`, `constructs`, `@cdktf/provider-azurerm`, `lodash.merge`, `zod` from deps.
- **README** rewritten to describe direct Terraform generation (no "Backed by CDKTF").

## Out of scope (this milestone)

- **Block D — Schema codegen / typed facade** (`terraform providers schema -json` → types).
- **Block E — full example migration** beyond the single azurerm example; multi-file
  output; monorepo / separate `@wrmsoftware/tf-generator-codegen` package.
- **`emitHcl` (HCL emission)** — deferred to a later milestone. `Block` stays in the
  Block A value model now (no-op in JSON) so authoring code doesn't need to change
  when HCL emission ships.
- **`count` / `for_each` as a resource/data/module block-level meta-argument** — i.e.
  Terraform itself creating multiple instances of a block, addressed by key/index
  (`azurerm_x.main["a"]`, `module.web["a"]`). Out of scope for `resource`, `data`,
  **and `module`** alike; use the TypeScript-loop convention (stable derived names,
  see the "Repetition" usage example) instead of a Terraform-native `for_each`/`count`.
  This is unrelated to `dynamic`'s own `for_each` key, which is in scope (see above).
- Terraform expression engine, state/apply orchestration, provider aliases,
  round-trip import.
- **`locals`** — no builder method this milestone. Most local-variable use cases are
  just plain TypeScript at author time; the real gap (reshaping `Ref`-bearing values
  that are only known at apply time, e.g. flattening a `for_each`-sourced module
  output) is deferred to a later milestone.
- Running real `terraform validate` inside the unit test suite (it is a documented
  CI/manual step, not a unit test).

## Success criteria

1. **CDKTF is gone.** No `cdktf`, `constructs`, `@cdktf/provider-azurerm`, `lodash.merge`,
   or `zod` in `package.json`; no import of them anywhere in `src/` or `examples/`.
2. **Core compiles.** `bun run check` (`tsc -b`) passes with `strict` on.
3. **The JSON emitter works.** Given a `TfBuilder` program, `emitJson` yields valid
   Terraform JSON (refs as `"${...}"`, `Block` dropped as a no-op marker).
4. **Example runs.** The azurerm example executes under Bun and prints/writes
   `.tf.json`; the emitted JSON passes `terraform validate` (verified manually / in CI,
   documented in the example README). **If `terraform` is unavailable in the
   environment, do not mark this criterion done or skip it silently — flag it as
   unverified per the Escalation section below.**
5. **Tests green.** `vitest` suite passes and covers: ref encoding (`"${...}"`),
   `Block` no-op behavior, a `dynamic`-block passthrough case, `module()` wiring
   (local-path `source` + `Addressable.attr()` on its output), array/object nesting,
   and a full-program snapshot for `emitJson`.
6. **Public API is the intended surface.** `src/index.ts` exports exactly `TfBuilder`,
   `ref`, `Ref`, `block`, `Block`, `emitJson`, and the value types; `IR` and
   `Addressable` are **not** exported.

## Key decisions (from Phase 0 grill)

- Scope = A+B+C + one example + unit tests; D and E deferred.
- `dynamic` blocks need no new IR primitive — Terraform's JSON syntax already treats
  `dynamic` as literal structure; `locals` deferred (no builder method yet).
- `emitHcl` deferred to a later milestone; `emitJson` alone ships (Terraform accepts
  `.tf.json` natively, so it's production-usable on its own).
- Test runner = **vitest**; assert emitter output; `validate` is a CI/doc step.
- Example provider = **azurerm**, multi-resource wiring.
- **IR is internal** — free to evolve; codegen (later) targets the builder, not the IR.
- **Wipe & rewrite in-place**, single package; purge CDKTF deps now; monorepo deferred.
- Keep the existing build chain (`tsc → babel esm/cjs`); rename the `terrakit` tsconfig path alias to `@wrmsoftware/tf-generator`.
- Version: breaking major, handled at release time via `release-it` (not decided here).

## Escalation on ambiguous outcomes

- **Criterion 4 unverifiable** (no `terraform` CLI in the environment): stop and report
  it as an explicit unverified/blocked item — do not mark the milestone done and do not
  silently drop the check. A human decides whether to install `terraform`, verify
  elsewhere, or accept the gap for this milestone.
- **Git push preflight fails** (wrong account / no access to `WRM-Software/tf-generator`):
  stop before making any commits and escalate — do not retry blindly or fall back to
  force-push/alternate remotes.

## Notes

- Old `src/` and examples are preserved in git history on `main`; deletion here is safe.
- The reference implementation in `draft/`-adjacent `terrakit.ts` (uploaded) is the
  canonical shape for A/B/C; the example there is AWS but this milestone's example is Azure.
