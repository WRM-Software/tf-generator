# Contract — Emitters (Block C)

Both emitters read the same IR. Canonical reference: uploaded `terrakit.ts`.

```ts
export function emitJson(tf: TfBuilder): string;   // Terraform JSON (.tf.json), pretty-printed (2-space)
export function emitHcl(tf: TfBuilder): string;    // HCL (.tf)
```

## emitJson encoding rules

| Value | Encoded as |
| ----- | ---------- |
| `Ref` | string `"${expr}"` |
| `Block` | its underlying object (marker dropped); array body → array of encoded objects |
| array | recursively encoded array |
| object (`TfObject`) | recursively encoded object |
| primitive (`string`/`number`/`boolean`/`null`) | as-is |

Document assembly:
- `terraform` → `doc.terraform` (if present)
- `provider[]` → `doc.provider[name] = body`
- `resource[]`, `data[]` → grouped `doc.resource[type][name] = body` (and `data`)
- `variable[]`, `output[]`, `module[]` → `doc.<kind>[name] = body`
- Output: `JSON.stringify(doc, null, 2)`.

## emitHcl encoding rules

| Value | Rendered as |
| ----- | ----------- |
| `Ref` | bare expression, **no quotes** (`aws_vpc.main.id`) |
| `string` | quoted; `${` → `$${` and `%{` → `%%{` escaped so literals aren't interpolated |
| `number` / `boolean` | rendered directly |
| `null` | `null` |
| array | `[a, b, c]` (elements rendered per these rules) |
| plain object (as a value) | `{ k = v }` map attribute |
| `Block` (as an attribute in a body) | `key { ... }` block; repeated once per array element |

Block/body assembly:
- Top-level blocks rendered in kind order: `terraform`, `provider`, `resource`, `data`,
  `variable`, `output`, `module`.
- `resource`/`data` → `kind "type" "name" { <body> }`; others → `kind "name" { <body> }`.
- Inside a body: a `Block`-valued key becomes block syntax (no `=`); every other key
  becomes `key = <value>`.
- Nested indentation is 2 spaces per level.
- Output ends with a trailing newline; blocks separated by a blank line.

## Guarantees & non-guarantees

- **Guarantee:** literal vs reference is unambiguous — controlled solely by `Ref`.
- **Guarantee:** JSON output is structurally equivalent regardless of `Block` usage
  (Block is HCL-only; JSON drops the marker).
- **Non-guarantee:** HCL is NOT canonically formatted. Consumers pipe through
  `terraform fmt`. Snapshot tests assert this emitter's own output, not `fmt` output.
