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
- `provider[]` → grouped by `name`: a name with exactly one config →
  `doc.provider[name] = body`; a name with 2+ configs (aliasing) →
  `doc.provider[name] = [body, ...]`, one array entry per `tf.provider()` call
  sharing that name, in call order
- `resource[]`, `data[]` → grouped `doc.resource[type][name] = body` (and `data`)
- `variable[]`, `output[]`, `module[]` → `doc.<kind>[name] = body`
- Output: `JSON.stringify(doc, null, 2)`.

Note: `dynamic` blocks need no dedicated row above — a `dynamic` key's value is just
another `TfObject`, encoded structurally like any other nested object. See Block A's
`core-types.md` for the authoring pattern.

## Provider aliasing (supported)

Two or more `tf.provider()` calls sharing the same `name` (e.g. one unaliased default
plus one or more `alias`ed configs) all survive in the output as an array:
`"provider": { "azurerm": [ {...default}, { "alias": "x", ... } ] }`. A name with only
one config still emits as a bare object, not a one-element array, to match prior
(pre-aliasing) output. Fixed in response to WRM-Software/tf-generator#2 — a real
downstream consumer needed an aliased provider to coexist with the default one, and
the previous single-key-assignment assembly silently dropped whichever config came
first.

## Guarantees & non-guarantees

- **Guarantee:** literal vs reference is unambiguous — controlled solely by `Ref`.
- **Guarantee:** output is structurally equivalent regardless of `Block` usage
  (`Block` is a no-op in JSON; authoring code that uses `block()` stays
  forward-compatible once `emitHcl` ships).
