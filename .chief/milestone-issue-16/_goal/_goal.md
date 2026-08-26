# Goal — milestone-issue-16: Terraform Generation Core (drop CDKTF)

**Issue:** #16 — "Ignore CDKTF, moving to Terraform Generation"
**Shaped spec:** `draft/terrakit-spec.md` (Blocks A + B + C of the A–E end-goal)

---

## Outcome

Replace the deprecated CDKTF-backed implementation with a **self-contained untyped
core** that authors Terraform configuration in TypeScript and emits it directly as
`.tf.json` and `.tf`. No CDKTF, no constructs, no synth engine.

This milestone delivers the **A → B → C spine** end-to-end (value model/IR → builder →
emitters), proven by one real example and a unit-tested emitter. The typed facade
(Block D) and broader example migration (Block E) are explicitly **out of scope** and
land in later milestones.

## In scope

- **Block A — Core value model & IR:** `Ref`, `Block`, `TfValue`/`TfObject`/`TfPrimitive`,
  the internal `IR`, and the internal `Addressable` handle (`.address`, `.attr(path)`).
- **Block B — Builder API:** `TfBuilder` with the full method set — `terraform`,
  `provider`, `resource`, `data`, `variable`, `output`, `module`.
- **Block C — Emitters:** `emitJson` (structural) and `emitHcl` (quoting/escaping/block
  rules), both reading the same IR.
- **One example:** `azurerm` multi-resource wiring (resource group → service plan →
  linux web app), authored with the untyped core, emitting both formats, demonstrating
  cross-resource references.
- **Unit tests:** `vitest`, asserting emitter output (snapshots + targeted cases).
- **Full CDKTF purge:** delete old `src/` and all three old examples; remove
  `cdktf`, `constructs`, `@cdktf/provider-azurerm`, `lodash.merge`, `zod` from deps.
- **README** rewritten to describe direct Terraform generation (no "Backed by CDKTF").

## Out of scope (this milestone)

- **Block D — Schema codegen / typed facade** (`terraform providers schema -json` → types).
- **Block E — full example migration** beyond the single azurerm example; multi-file
  output; monorepo / separate `@wrmsoftware/tf-generator-codegen` package.
- `count` / `for_each` / `dynamic`, Terraform expression engine, state/apply
  orchestration, provider aliases, round-trip import.
- Running real `terraform validate` inside the unit test suite (it is a documented
  CI/manual step, not a unit test).

## Success criteria

1. **CDKTF is gone.** No `cdktf`, `constructs`, `@cdktf/provider-azurerm`, `lodash.merge`,
   or `zod` in `package.json`; no import of them anywhere in `src/` or `examples/`.
2. **Core compiles.** `bun run check` (`tsc -b`) passes with `strict` on.
3. **Both emitters work.** Given a `TfBuilder` program, `emitJson` yields valid Terraform
   JSON (refs as `"${...}"`) and `emitHcl` yields valid HCL (refs bare, strings quoted &
   `${`/`%{` escaped, `Block` rendered as block syntax repeated per array element).
4. **Example runs.** The azurerm example executes under Bun and prints/writes both `.tf`
   and `.tf.json`; the emitted `.tf` passes `terraform fmt -check` and `terraform validate`
   (verified manually / in CI, documented in the example README).
5. **Tests green.** `vitest` suite passes and covers: ref bareness (HCL) vs `${}` (JSON),
   string interpolation escaping, `Block` vs map-attribute rendering, array/object nesting,
   and a full-program snapshot for each emitter.
6. **Public API is the intended surface.** `src/index.ts` exports exactly `TfBuilder`,
   `ref`, `Ref`, `block`, `Block`, `emitJson`, `emitHcl`, and the value types; `IR` and
   `Addressable` are **not** exported.

## Key decisions (from Phase 0 grill)

- Scope = A+B+C + one example + unit tests; D and E deferred.
- Test runner = **vitest**; assert emitter output; `validate` is a CI/doc step.
- Example provider = **azurerm**, multi-resource wiring.
- **IR is internal** — free to evolve; codegen (later) targets the builder, not the IR.
- **Wipe & rewrite in-place**, single package; purge CDKTF deps now; monorepo deferred.
- Keep the existing build chain (`tsc → babel esm/cjs`); rename the `terrakit` tsconfig path alias to `@wrmsoftware/tf-generator`.
- Version: breaking major, handled at release time via `release-it` (not decided here).

## Notes

- Old `src/` and examples are preserved in git history on `main`; deletion here is safe.
- The reference implementation in `draft/`-adjacent `terrakit.ts` (uploaded) is the
  canonical shape for A/B/C; the example there is AWS but this milestone's example is Azure.
