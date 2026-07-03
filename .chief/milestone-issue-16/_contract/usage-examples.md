# Contract — End-user usage examples

Canonical authoring surface as an end user of `terrakit` experiences it. These snippets
are **normative**: the public API must make each one compile and emit the shown output.
Only the untyped core is exercised (typed facade = Block D, a later milestone).

## 1. Minimal — one resource + output

```ts
import { TerraKit, emitHcl, emitJson } from "terrakit";

const tf = new TerraKit();

const rg = tf.resource("azurerm_resource_group", "main", {
  name: "rg-app",
  location: "southeastasia",
});

tf.output("rg_id", { value: rg.attr("id") });

console.log(emitHcl(tf));
console.log(emitJson(tf));
```

Emits (HCL):

```hcl
resource "azurerm_resource_group" "main" {
  name     = "rg-app"
  location = "southeastasia"
}

output "rg_id" {
  value = azurerm_resource_group.main.id
}
```

Emits (JSON, shape):

```json
{
  "resource": {
    "azurerm_resource_group": { "main": { "name": "rg-app", "location": "southeastasia" } }
  },
  "output": { "rg_id": { "value": "${azurerm_resource_group.main.id}" } }
}
```

Note: in HCL the ref is **bare**; in JSON it is `"${...}"`. String literals are quoted in both.

## 2. Cross-resource wiring — the flagship example (`examples/azurerm-webapp`)

```ts
import { TerraKit, block, emitHcl } from "terrakit";

const tf = new TerraKit();

tf.terraform({
  required_providers: block({
    azurerm: { source: "hashicorp/azurerm", version: "~> 4.0" },
  }),
});

tf.provider("azurerm", { features: block({}) });

const rg = tf.resource("azurerm_resource_group", "main", {
  name: "rg-app",
  location: "southeastasia",
});

const plan = tf.resource("azurerm_service_plan", "app", {
  name: "asp-app",
  resource_group_name: rg.attr("name"),   // OUTPUT(rg) -> INPUT(plan)
  location: rg.attr("location"),
  os_type: "Linux",
  sku_name: "P1v3",
});

const site = tf.resource("azurerm_linux_web_app", "web", {
  name: "app-web",
  resource_group_name: rg.attr("name"),
  location: rg.attr("location"),
  service_plan_id: plan.attr("id"),        // OUTPUT(plan) -> INPUT(site)
  site_config: block({}),                  // required nested block
});

tf.output("default_hostname", { value: site.attr("default_hostname") });

console.log(emitHcl(tf));
```

Key points the example must demonstrate:
- `required_providers` and `provider "azurerm" { features {} }` use `block()` (blocks, not map attrs).
- `site_config {}` is a nested **block** via `block()`.
- Cross-resource references flow through `handle.attr(path)` and render bare in HCL.

## 3. Repetition — unroll in TypeScript (no count/for_each)

```ts
const zones = ["1", "2", "3"];
const disks = zones.map((z) =>
  tf.resource("azurerm_managed_disk", `data_${z}`, {   // stable name, NOT index
    name: `disk-data-${z}`,
    resource_group_name: rg.attr("name"),
    location: rg.attr("location"),
    storage_account_type: "Premium_LRS",
    create_option: "Empty",
    disk_size_gb: 128,
    zone: z,
  }),
);

tf.output("disk_ids", { value: disks.map((d) => d.attr("id")) });
```

- N static blocks, one per element. Labels derive from a **stable key** (`data_${z}`),
  never the loop index, so adding/removing an element does not shift addresses.
- An array of refs (`disks.map(d => d.attr("id"))`) renders as an HCL list of bare refs
  / a JSON array of `"${...}"` strings.

## 4. Variables and raw expressions (escape hatch)

```ts
import { ref } from "terrakit";

const location = tf.variable("location", { type: ref("string"), default: "southeastasia" });

tf.resource("azurerm_resource_group", "byvar", {
  name: "rg-byvar",
  location,                                  // Ref -> var.location, bare in HCL
  tags: { managed_by: ref("terraform.workspace") },  // raw passthrough expression
});
```

- `tf.variable(name, body?)` returns `Ref("var.<name>")` for direct wiring.
- `ref(expr)` is the unchecked passthrough for any raw Terraform expression string.
- `type: ref("string")` keeps `string`/`list(string)` etc. as bare HCL type expressions,
  not quoted literals.

## 5. Emitting to files (author's own glue — not part of the library)

The library returns strings; writing files is the caller's responsibility (Bun/Node):

```ts
import { emitHcl, emitJson } from "terrakit";
// Bun example
await Bun.write("out/main.tf", emitHcl(tf));
await Bun.write("out/main.tf.json", emitJson(tf));
```

Then, as a documented workflow (not enforced by the lib):

```sh
terraform -chdir=out fmt
terraform -chdir=out validate
```
