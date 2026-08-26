# Task 4 — Block C: `emitJson`

## Goal

Implement `emitJson(tf: TfBuilder): string`, reading `TfBuilder`'s internal `IR` and
producing pretty-printed Terraform JSON. Depends on tasks 2 (value model/IR) and 3
(`TfBuilder`). New source file(s) only — not wired into `src/index.ts` yet (task 5).

## Contract reference

`_contract/emitters.md` (Block C) — canonical encoding rules + document assembly +
the two notes at the bottom (dynamic passthrough, provider-aliasing known limitation).

## Steps

1. Implement the encoding rules exactly as tabulated:
   - `Ref` → string `"${expr}"`.
   - `Block` → its underlying object, marker dropped (array body → array of encoded
     objects). This is intentionally a no-op beyond unwrapping — no HCL logic.
   - array → recursively encoded array.
   - object (`TfObject`) → recursively encoded object. This includes any `dynamic` key
     — it needs **zero special-case code**, per the contract's explicit note; it's
     just another nested object encoded the same generic way. Do not add any
     `dynamic`-specific branch.
   - primitives → as-is.
2. Implement document assembly exactly as specified:
   - `terraform` → `doc.terraform` if present.
   - `provider[]` → `doc.provider[name] = body` (single body per name — this milestone
     only ever has one default provider per name; do NOT build array-based assembly
     for aliasing, that's explicitly out of scope and flagged as a known limitation in
     the contract for a later milestone to fix).
   - `resource[]`/`data[]` → grouped `doc.resource[type][name] = body` (and `data`).
   - `variable[]`/`output[]`/`module[]` → `doc.<kind>[name] = body`.
   - Output via `JSON.stringify(doc, null, 2)`.
3. Do not implement `emitHcl` — deferred, not part of this milestone at all (not even
   a stub).

## Acceptance

- `bun run check` passes.
- Manually trace usage-examples.md's example 1 (minimal) through your implementation
  by hand — confirm the encoded shape matches the "Emits (JSON, shape)" block in that
  example. Note in your task report if it doesn't line up (don't silently deviate from
  the contract to make it match — flag the discrepancy instead).
- Commit once `bun run check` is green.

## Out of scope

- `emitHcl` — fully deferred, no stub needed.
- Any provider-aliasing array assembly — flagged as a future concern, not this task's.
- Wiring into `src/index.ts` — task 5.
