# Security — key safety in generated key/value structures

Any code that builds a plain-object map keyed by external or library-input
strings (resource type, resource name, module name, or any other
caller-supplied key) MUST use a null-prototype accumulator, not a bare object
literal:

```ts
// Wrong — vulnerable to prototype pollution if key === "__proto__"
const acc: Record<string, unknown> = {};
acc[key] = value;

// Right
const acc: Record<string, unknown> = Object.create(null);
acc[key] = value;
```

## Why

A bare `{}` inherits `Object.prototype`, which has a special `__proto__`
accessor. If a caller-controlled key is `"__proto__"`, `acc[key1][key2] = value`
can silently reach and mutate the real, shared `Object.prototype` instead of
creating an own property — polluting it process-wide (CWE-1321). This is a
real, exploitable vulnerability class, not a theoretical one — CodeQL's
`js/prototype-polluting-assignment` query catches exactly this pattern.

## Where this applies

Any emitter/codegen/document-assembly code that groups values by an
externally-supplied string (e.g. `emitJson`'s `resource[type][name]`,
`data[type][name]` assembly, and any future `emitHcl` or Block D/E work
building similar type/name-keyed structures).

## Notes

- `Object.create(null)` objects serialize identically via `JSON.stringify` —
  no behavior change to the emitted output.
- `Map` is an equally valid alternative where the final structure doesn't need
  to be a plain object (e.g. an intermediate accumulator that gets converted
  before output) — either is acceptable, don't add unnecessary abstraction if
  the existing plain-object shape works fine with a null prototype.
