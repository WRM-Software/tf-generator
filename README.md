# tf-generator

Author Terraform configuration in TypeScript, emitted directly as `.tf.json` —
no CDKTF, no synth engine, no `constructs`. You build up resources, providers,
data sources, variables, outputs, and modules with a plain `TfBuilder`, then
call `emitJson` to get a Terraform JSON document ready for `terraform` itself.

> This initial release is aimed at gathering **feedback** before refining
> further.

HCL emission (`emitHcl`) is a planned follow-up — not shipped yet. Today the
library only emits Terraform JSON (`.tf.json`).

## How it works

```ts
import { TfBuilder, block, emitJson } from "@wrmsoftware/tf-generator";

const tf = new TfBuilder();

tf.provider("azurerm", { features: block({}) });

const rg = tf.resource("azurerm_resource_group", "main", {
  name: "rg-app",
  location: "southeastasia",
});

const plan = tf.resource("azurerm_service_plan", "app", {
  name: "asp-app",
  resource_group_name: rg.attr("name"), // cross-resource reference
  location: rg.attr("location"),
  os_type: "Linux",
  sku_name: "P1v3",
});

const json = emitJson(tf);
```

- `TfBuilder` — the single builder you interact with: `.terraform()`,
  `.provider()`, `.resource()`, `.data()`, `.variable()`, `.output()`, and
  `.module()`.
- Resource/data/module handles returned by the builder expose `.attr(path)`
  to build cross-resource references (e.g. `rg.attr("name")`) without hand-
  writing interpolation strings.
- `block(...)` marks a value as an HCL-style nested block (a no-op today
  under `emitJson`, but reserved for `emitHcl` later).
- `ref(...)` lets you write a raw Terraform expression string directly when
  there's no builder-produced handle for it.
- `emitJson(tf)` reads the builder's accumulated state and returns a
  pretty-printed Terraform JSON string — write it to a `.tf.json` file and
  run `terraform` against it as usual.

## Starter Project

There isn't a starter project for this core yet. The previous CDKTF-era
starter (`thaitype/terrakit-starter`) doesn't apply to this API and hasn't
been replaced — see `examples/azurerm-webapp` below for a complete, runnable
program instead.

## Run Examples

The flagship example is `examples/azurerm-webapp` (resource group -> service
plan -> Linux web app, wired with cross-resource `.attr()` references).

```sh
# from the repo root — builds dist/, which the example depends on via
# "@wrmsoftware/tf-generator": "file:../.."
bun run build

# then run the example
cd examples/azurerm-webapp
bun install
bun run start
```

This prints the emitted JSON to stdout and writes it to
`examples/azurerm-webapp/out/main.tf.json`. See that example's own README for
details, including validating the output with `terraform validate`.

### Clean all Examples built files

```
make clean-all
```
