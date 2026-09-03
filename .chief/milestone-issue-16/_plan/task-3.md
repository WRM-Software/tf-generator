# Task 3 — Block B: `TfBuilder` builder API

## Goal

Implement the `TfBuilder` class — the single builder end users interact with. Depends
on task 2's `IR`/`Addressable`/`Ref` types. New source file(s) only — not wired into
`src/index.ts` yet (task 5).

## Contract references

- `_contract/builder-api.md` (Block B) — canonical method table + Rules section.
- `_contract/core-types.md` — the `IR`/`Addressable`/`Ref` types this builds on (task 2).
- `_contract/usage-examples.md` — examples 1–5 are **normative**: `TfBuilder` must make
  each one compile once task 5 wires up the public exports (you can sanity-check your
  method signatures against these now, even though the actual compile check with real
  imports happens after task 5).

## Steps

Implement `TfBuilder` with exactly these methods, per `builder-api.md`'s table:

- `terraform(body: TfObject): this` — shallow-merges into the single `terraform` block.
- `provider(name: string, body: TfObject): this` — pushes `{name, body}` to `ir.provider`.
- `resource(type: string, name: string, body: TfObject): Addressable` — pushes to
  `ir.resource`, returns `Addressable(\`${type}.${name}\`)`.
- `data(type: string, name: string, body: TfObject): Addressable` — pushes to `ir.data`,
  returns `Addressable(\`data.${type}.${name}\`)`.
- `variable(name: string, body?: TfObject): Ref` — pushes to `ir.variable`, returns
  `Ref("var.<name>")`.
- `output(name: string, body: TfObject): this` — pushes to `ir.output`.
- `module(name: string, body: TfObject): Addressable` — pushes to `ir.module`, returns
  `Addressable("module.<name>")`. Per the Rules section: `body` just carries `source`
  (a plain string, e.g. a local relative path) plus whatever inputs — no special
  handling needed. Do NOT add `count`/`for_each` support to any of these methods (all
  deferred this milestone, per `_goal/_goal.md`) and do NOT add indexed addressing to
  `Addressable` — `module`'s address is always the plain `module.<name>` form.

Rules to enforce (from `builder-api.md`):
- Chainable methods return `this`; referenceable methods return `Addressable`;
  `variable` returns a `Ref`.
- No deduplication, no name-collision checks, no ordering guarantees beyond insertion
  order per kind — don't add validation the contract doesn't ask for.
- `Addressable` and `IR` stay internal (task 2 already keeps them out of the public
  path; don't change that here).

## Acceptance

- `bun run check` passes.
- Method signatures match the table exactly (arg types, return types).
- Manually trace usage-examples.md's examples 1, 2, 4, 5 against your implementation
  (don't need real imports yet — just confirm the method calls used in those snippets
  match what you built) and note in your task report if anything doesn't line up.
- Commit once `bun run check` is green.

## Out of scope

- Emitters (`emitJson`) — task 4.
- Wiring into `src/index.ts` — task 5.
- Anything from `count`/`for_each`/`locals`/provider-aliasing — all deferred, don't
  add speculative support "for later."
