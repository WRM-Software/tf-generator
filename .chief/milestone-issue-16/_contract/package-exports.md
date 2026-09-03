# Contract — Public API surface & packaging

## `src/index.ts` exports (exact set)

```ts
export { TfBuilder } from "./TfBuilder";
export { Ref, ref } from "./...";       // markers
export { Block, block } from "./...";
export { emitJson } from "./...";
export type { TfPrimitive, TfValue, TfObject } from "./...";
```

**MUST export:** `TfBuilder`, `ref`, `Ref`, `block`, `Block`, `emitJson`,
`TfPrimitive`, `TfValue`, `TfObject`.

**MUST NOT export:** `IR` (and its `NamedBlock`/`LabelBlock` helpers), `Addressable`.

(File layout within `src/` is the implementer's choice; the export set above is the contract.)

## package.json

- Remove dependencies: `cdktf`, `constructs`, `lodash.merge`, `zod`.
- Remove devDependencies: `@cdktf/provider-azurerm`, `@types/lodash.merge`.
- Add devDependency: `vitest`.
- Add script: `"test": "vitest run"` (and optionally `"test:watch": "vitest"`).
- Rename package to `@wrmsoftware/tf-generator` (from `terrakit`); keep `type: module`, existing build chain
  (`build` / `build-esm` / `build-cjs` / `build-annotate`), `check`, `format`.
- `main` / `module` / `types` / `exports` unchanged (still `dist/{cjs,esm,dts}`).
- Version bump is deferred to release time (`release-it`); do not hand-edit `version`.

## Deletions

- Delete old core: `src/BlockComposer.ts`, `src/TerrakitStack.ts`, `src/Terrakit.ts`,
  `src/types.ts`, `src/internal/utils.ts` (rewrite fresh).
- Delete old examples: `examples/basic`, `examples/cross-stacks`, `examples/merge-controller`.

## New example

- Path: `examples/azurerm-webapp` (single example).
- Contents: azurerm multi-resource wiring — resource group → service plan →
  linux web app — authored with the untyped core, wiring cross-resource references via
  `.attr(...)` / handle refs.
- Emits `.tf.json` (JSON only this milestone).
- Example README documents the emit → `terraform validate` workflow.
- Its own `package.json` depends only on `@wrmsoftware/tf-generator` (+ Bun types); NO cdktf.

## README (root)

- Rewrite to describe direct Terraform generation. Remove "Backed by CDKTF" and the
  CDKTF-oriented feature list. Describe: author in TS → `emitJson` → plain
  `terraform` (note HCL emission as a planned follow-up, not shipped yet).
