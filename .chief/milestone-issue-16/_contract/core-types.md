# Contract — Core value model & IR (Block A)

Canonical reference: uploaded `terrakit.ts`. These types are the substrate the builder
and emitters operate on.

## Markers

```ts
export class Ref {
  readonly _tag: "ref";
  constructor(readonly expr: string);
  toString(): string;            // returns this.expr
}
export const ref: (expr: string) => Ref;

export class Block {
  readonly _tag: "block";
  constructor(readonly body: TfObject | TfObject[]);
}
export const block: (body: TfObject | TfObject[]) => Block;
```

- `Ref` wraps a Terraform address / raw expression. Detected by `instanceof Ref`.
- `Block` forces HCL block syntax (vs map attribute) once `emitHcl` ships (deferred
  this milestone) — currently a no-op marker for `emitJson`. Detected by
  `instanceof Block`. An **array** body means the block is repeated once per element.
- `_tag` fields are retained as discriminants but detection is by `instanceof`.

## Value model

```ts
export type TfPrimitive = string | number | boolean | null;
export type TfValue = TfPrimitive | Ref | Block | TfValue[] | TfObject;
export interface TfObject { [key: string]: TfValue }
```

`TfObject` is intentionally loose — no per-resource typing at this layer (that is Block D,
a later milestone).

## Dynamic blocks (no new primitive)

Terraform's JSON syntax already treats `dynamic` as literal structure, so no new
value-model class is needed. Author it directly as a `dynamic` key inside any body
`TfObject`:

```ts
tf.resource("azurerm_linux_web_app", "web", {
  name: "app-web",
  // ...
  dynamic: {
    ip_restriction: {
      for_each: ref("var.ip_rules"),
      content: { ip_address: ref("ip_restriction.value.cidr") },
    },
  },
});
```

- `for_each` and everything inside `content` are ordinary `TfValue`s — use `ref()` for
  any expression, including the dynamic iterator (`<blockName>.value.<x>`), which is a
  raw Terraform expression this library doesn't resolve or validate.
- `emitJson` needs **zero special-case logic** for this — a `dynamic` key's value is
  just another nested object, encoded structurally like any other `TfObject`.
- This `for_each` is unrelated to the resource/data/module **block-level** `for_each`
  meta-argument (Terraform creating multiple instances of a block) — that one stays
  out of scope this milestone. Same keyword, two different mechanisms: this one
  repeats nested attribute blocks inside one instance that already exists.

## IR (INTERNAL — not exported)

```ts
type NamedBlock = { type: string; name: string; body: TfObject };  // resource/data
type LabelBlock = { name: string; body: TfObject };                // provider/variable/output/module

interface IR {
  terraform?: TfObject;
  provider: LabelBlock[];
  resource: NamedBlock[];
  data: NamedBlock[];
  variable: LabelBlock[];
  output: LabelBlock[];
  module: LabelBlock[];
}
```

- Mirrors Terraform's own top-level document structure so emitters stay trivial.
- The IR shape is an implementation detail and **must not** be exported from `index.ts`.
  It is free to change in future milestones.

## Addressable (INTERNAL — not exported)

```ts
class Addressable {
  constructor(readonly address: string);
  attr(path: string): Ref;       // new Ref(`${this.address}.${path}`)
}
```

- Returned by referenceable builder methods (`resource`, `data`, `module`).
- `data` addresses are prefixed with `data.`; `module` attributes reference
  `module.<name>.<x>` (address = `module.<name>`).

## Invariants

- No validation of body contents at this layer — malformed bodies surface at
  `terraform validate`.
- Emitters distinguish literal vs reference **only** by `instanceof Ref`; a plain string
  is always a literal.
