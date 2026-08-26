# Contract — Builder API (Block B)

`TfBuilder` is the single builder. Canonical reference: uploaded `terrakit.ts`.

```ts
export class TfBuilder {
  readonly ir: IR;               // internal type; property visibility per impl (not part of public d.ts surface)

  terraform(body: TfObject): this;                 // merges into singleton terraform {} block
  provider(name: string, body: TfObject): this;    // one label
  resource(type: string, name: string, body: TfObject): Addressable;  // two labels
  data(type: string, name: string, body: TfObject): Addressable;      // address prefixed with data.
  variable(name: string, body?: TfObject): Ref;    // returns Ref("var.<name>")
  output(name: string, body: TfObject): this;      // one label
  module(name: string, body: TfObject): Addressable; // address module.<name>
}
```

## Method contract

| Method | Returns | Behavior |
| ------ | ------- | -------- |
| `terraform(body)` | `this` | Shallow-merges `body` into the single `terraform` block (`{...prev, ...body}`). |
| `provider(name, body)` | `this` | Pushes `{ name, body }` to `ir.provider`. Keyed by name; alias/array form is out of scope. |
| `resource(type, name, body)` | `Addressable(`\``${type}.${name}`\``)` | Pushes `{ type, name, body }` to `ir.resource`. |
| `data(type, name, body)` | `Addressable(`\``data.${type}.${name}`\``)` | Pushes `{ type, name, body }` to `ir.data`. |
| `variable(name, body?)` | `Ref("var.<name>")` | Pushes `{ name, body ?? {} }` to `ir.variable`. |
| `output(name, body)` | `this` | Pushes `{ name, body }` to `ir.output`. |
| `module(name, body)` | `Addressable("module.<name>")` | Pushes `{ name, body }` to `ir.module`. |

## Rules

- Chainable methods return `this`; referenceable declarations return an `Addressable`;
  `variable` returns a `Ref` for direct wiring.
- No deduplication, no name-collision checks, no ordering guarantees beyond
  insertion order per kind.
- Stable resource names are a **documented convention** (derive labels from stable keys,
  not loop indices) — NOT enforced in code.
- `Addressable` and `IR` are internal; only `TfBuilder` (the class) is exported.
