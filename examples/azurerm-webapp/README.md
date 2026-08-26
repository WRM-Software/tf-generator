# azurerm-webapp example

Flagship example for `@wrmsoftware/tf-generator`: authors an `azurerm` resource
group -> service plan -> Linux web app in TypeScript, wiring cross-resource
references via `.attr(...)`, then emits the result as Terraform JSON
(`.tf.json`).

See `src/main.ts` for the program (mirrors the milestone contract's
"Cross-resource wiring" usage example).

## Local dependency resolution

This example is not published — it depends on the sibling package in this repo
via a `file:` dependency:

```json
"@wrmsoftware/tf-generator": "file:../.."
```

Because the package's `main`/`module`/`types` fields point at `dist/`, you must
build the library once before installing/running the example:

```sh
# from the repo root
bun run build

# then, from this directory
bun install
```

## Running the example

```sh
bun run start
```

This runs `src/main.ts`, which:

1. Builds the `TfBuilder` program (provider config, resource group, service
   plan, Linux web app, and an output).
2. Prints the emitted JSON to stdout.
3. Writes it to `out/main.tf.json` (via `Bun.write`).

## Validating the output with Terraform

The library only emits JSON — it does not invoke Terraform. To check the
emitted config is valid, run the Terraform CLI against the output directory:

```sh
terraform -chdir=out init -backend=false
terraform -chdir=out validate
```

(No `terraform fmt` step — that's HCL-only formatting, and this milestone only
emits JSON.)

`out/` is git-ignored (generated output, plus any `.terraform`/provider files
`terraform init` downloads); regenerate it by re-running `bun run start`.
