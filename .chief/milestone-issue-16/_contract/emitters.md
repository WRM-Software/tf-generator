# Contract — Emitters (Block C)

Canonical reference: uploaded `terrakit.ts`. This milestone ships JSON only —
`emitHcl` is deferred to a later milestone (Terraform accepts `.tf.json` natively,
so `emitJson` alone is valid, production-usable output).

```ts
export function emitJson(tf: TfBuilder): string;   // Terraform JSON (.tf.json), pretty-printed (2-space)
```

## emitJson encoding rules

| Value | Encoded as |
| ----- | ---------- |
| `Ref` | string `"${expr}"` |
| `Block` | its underlying object (marker dropped — only matters once `emitHcl` ships); array body → array of encoded objects |
| array | recursively encoded array |
| object (`TfObject`) | recursively encoded object |
| primitive (`string`/`number`/`boolean`/`null`) | as-is |

Document assembly:
- `terraform` → `doc.terraform` (if present)
- `provider[]` → `doc.provider[name] = body`
- `resource[]`, `data[]` → grouped `doc.resource[type][name] = body` (and `data`)
- `variable[]`, `output[]`, `module[]` → `doc.<kind>[name] = body`
- Output: `JSON.stringify(doc, null, 2)`.

Note: `dynamic` blocks need no dedicated row above — a `dynamic` key's value is just
another `TfObject`, encoded structurally like any other nested object. See Block A's
`core-types.md` for the authoring pattern.

## Known limitation — provider aliasing (not yet supported)

The `provider[] → doc.provider[name] = body` assembly rule above assumes **one**
provider config per name (no aliases this milestone, per Out of scope in `_goal.md`).
That's a single-key object assignment — it silently overwrites if two provider blocks
share the same name, which is exactly what aliasing needs. Terraform's JSON syntax
requires an **array** per name once aliases exist:
`"provider": { "azurerm": [ {...default}, { "alias": "x", ... } ] }`. Whoever adds
alias support in a later milestone must change this assembly rule to build an array,
not overwrite a single object — flagging now so it isn't a silent bug when that
milestone lands.

## Guarantees & non-guarantees

- **Guarantee:** literal vs reference is unambiguous — controlled solely by `Ref`.
- **Guarantee:** output is structurally equivalent regardless of `Block` usage
  (`Block` is a no-op in JSON; authoring code that uses `block()` stays
  forward-compatible once `emitHcl` ships).
