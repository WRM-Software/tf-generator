# terrakit v1 — Shaped Design Spec

> Shaped top-down (vision → scope → building blocks → block specs) for **issue #16 —
> "Ignore CDKTF, moving to Terraform Generation."** This is the **end-goal** spec across
> all milestones; slice into a single milestone later via `/chief-plan` or `/slim-down`.
>
> **Status:** Draft · **Target runtime:** Bun / Node + TypeScript · **Release:** breaking major (post-v0.6.0)
>
> Companion source drafts: `terrakit.ts` (untyped core reference impl), `terrakitdesignspec.md`
> (design spec), `terrakitcontracts.md` (contracts & types).

---

## Layer 1 — Vision

- **What** — A minimal TypeScript layer that authors Terraform config and emits `.tf.json` /
  `.tf` directly, plus a typed facade generated from provider schemas. **No CDKTF.**
- **Why** — CDKTF is deprecated (upstream archived 2025-12-10) and heavy; teams want TypeScript
  ergonomics (loops, composition, type-safety) over plain Terraform with a tiny surface —
  *one builder, two emitters, two markers*. Generated output is a cheap, throwaway build artifact
  that the plain `terraform` CLI consumes.
- **Done looks like** — a former CDKTF stack, rewritten in terrakit, emits output that passes
  `terraform validate` with compile-time-checked inputs/outputs, and CDKTF is gone from the tree.

**Direction decisions:** complete rewrite (drop CDKTF entirely); design the full end-goal here,
milestones get sliced afterwards.

---

## Layer 2 — Scope

### In scope
- **Untyped core** — `TerraKit` builder + `Ref` / `Block` markers + the `IR`.
- **Two emitters** — `emitJson` (`.tf.json`) and `emitHcl` (`.tf`), reading the same IR.
- **Typed facade** — per-provider generated types (input vs output contract) from
  `terraform providers schema -json`, layered on top without touching the IR.
- **Codegen tool** — ingests `schema.json` → emits the typed facade.
- **Migration** — replace old examples with fresh ones on the new core; purge CDKTF from deps.

### Out of scope
- `count` / `for_each` / `dynamic` — repetition is unrolled in TypeScript.
- Terraform expression engine (`? :`, `for`, functions) — passthrough via `ref()` only.
- State management, `plan` / `apply` orchestration — plain `terraform` CLI does it.
- Provider `alias` model (multiple instances of same provider) — possible later extension.
- Round-trip import (HCL/JSON → IR).
- **Dropped with CDKTF (not preserved):** `BlockComposer` merge/override, `merge-controller`,
  the old `TerrakitStack`.
- Multi-file / stack-split output — **possible extension**, not core.

### Constraints
- Runtime: Bun / Node + TypeScript.
- Output must pass `terraform fmt` + `terraform validate`.
- Tiny surface area is a **hard design value** — resist feature creep.
- Existing package (`@thaitype/terrakit`, released to v0.6.0) → this is a breaking major.

### Users / Actors
- **Infra author** — writes TS, emits Terraform, runs the CLI.
- **Codegen maintainer** — regenerates the typed facade when providers bump.
- **CI** — runs `validate` on emitted output.

---

## Layer 3 — Building Blocks

| # | Block | Purpose | Depends on |
|---|-------|---------|------------|
| **A** | **Core value model & IR** | `Ref`, `Block`, `TfValue`/`TfObject`, the `IR` shape + `Addressable` handle | — |
| **B** | **Builder API** | `TerraKit` methods populating the IR | A |
| **C** | **Emitters** | `emitJson` (trivial) + `emitHcl` (quoting/escaping/block rules) | A, B |
| **D** | **Schema codegen** | `terraform providers schema -json` → typed facade | A |
| **E** | **Packaging & examples** | exports, CLI/entry, rewritten examples, CDKTF removal, workflow docs | B, C, D |

`A → B → C` is the untyped MVP spine. `D` is the typed layer on top. `E` ships it.

---

## Layer 4 — Block Specs

### Block A — Core value model & IR
**What it does:** Defines the neutral data everything else reads/writes. `Ref` (a reference /
raw-expr marker, rendered bare in HCL and `${}` in JSON), `Block` (forces HCL block syntax vs map
attr; no-op in JSON), the `TfValue` / `TfObject` value tree, the `IR` (top-level blocks keyed by
kind), and the `Addressable` handle (`.address`, `.attr(path) → Ref`).
**Key decisions:** Markers detected by `instanceof`. IR mirrors Terraform's own document structure
so both emitters stay trivial. Body objects stay loosely typed (`TfObject`) — typing is B's/D's
job, never the IR's.
**Open questions:** Do we freeze the IR shape as public API (so codegen can target it), or keep it
internal? `[TBD]`

### Block B — Builder API
**What it does:** `TerraKit` class with `terraform`, `provider`, `resource`, `data`, `variable`,
`output`, `module`. Referenceable declarations (`resource` / `data` / `module`) return an
`Addressable`; `variable` returns a `Ref` (`var.<name>`); the rest return `this` for chaining.
**Key decisions:** Fluent but not required. Stable resource names are a *convention* (documented),
not enforced. No validation — malformed bodies surface at `terraform validate`.
**Open questions:** Provider blocks keyed by name — alias/array form explicitly deferred (out of
scope). Confirmed OK.

### Block C — Emitters
**What it does:** `emitJson(tf)` → structural `JSON.stringify` (`Ref` → `"${expr}"`, `Block` →
underlying object, drop marker). `emitHcl(tf)` → printer: `Ref` bare, strings quoted + `${` / `%{`
escaped, `Block` → `key { … }` (repeated per array element), arrays/maps rendered per rules.
**Key decisions:** JSON emitter ships first (nearly free, production-usable) while HCL matures. HCL
output is *not* canonically formatted — pipe through `terraform fmt`.
**Open questions:** none — most settled block.

### Block D — Schema codegen
**What it does:** Reads `terraform providers schema -json`. For each resource/data source emits
**two types** — `…Input` (only `required` / `optional`; `computed`-only excluded) and the output
handle (`readonly …: Ref` for every attr) — plus a constructor wrapping `tf.resource(...)`. Maps
cty → TS (`string|Ref`, arrays, maps, objects), `block_types` + `nesting_mode` → `block()`,
`description` → JSDoc.
**Key decisions:** Generated from the CLI's resolved schema, **never** provider Go source or Azure
REST specs. Facade sits on top of A/B/C — IR & emitters never change. Every leaf is `T | Ref`.
**Open questions:**
- Ships as separate package `@thaitype/terrakit-codegen`? `[TBD, leaning yes]`
- How is `optional + computed` surfaced (optional input **and** output ref)? `[TBD]`
- Per-provider output layout (one file per resource vs one bundle)? `[TBD]`

### Block E — Packaging & examples
**What it does:** Package exports (core + markers + emitters), the codegen entry/CLI, rewritten
examples replacing `basic` / `cross-stacks` / `merge-controller`, full CDKTF removal from deps, and
a documented emit → `fmt` → `validate` workflow.
**Key decisions:** Breaking major release. Examples double as acceptance tests (`validate` passes).
CDKTF purge is a hard done-criterion.
**Open questions:** Which provider(s) do the flagship examples target — `azurerm`
(design spec's worked example) only, or `aws` too? `[TBD]`

---

## Open Questions Rollup
1. **[A]** Freeze IR as public API, or keep internal?
2. **[D]** Codegen as separate package `@thaitype/terrakit-codegen`? (leaning yes)
3. **[D]** Surface of `optional + computed` attributes.
4. **[D]** Per-provider generated file layout.
5. **[E]** Flagship example provider(s): `azurerm` only vs `azurerm` + `aws`.
6. **[F, dropped]** `fmt`/`validate` shell-out wrapper stays a documented workflow, not code.

## Next steps
- Resolve open questions via `/grill-design` (sharp, no persistence) or `/chief-grill`
  (codebase-verified).
- Slice into milestone 1 via `/chief-plan` or `/slim-down` — the `A → B → C` spine is the
  natural first increment.
