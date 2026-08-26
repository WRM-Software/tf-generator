/**
 * Flagship example — resource group -> service plan -> linux web app,
 * wired via `.attr()` cross-resource references.
 *
 * Reproduces usage-examples.md example 2 verbatim, then writes the emitted
 * JSON to disk per example 5's "Emitting to files" pattern.
 */
import { TfBuilder, block, emitJson } from "@wrmsoftware/tf-generator";

const tf = new TfBuilder();

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
  resource_group_name: rg.attr("name"), // OUTPUT(rg) -> INPUT(plan)
  location: rg.attr("location"),
  os_type: "Linux",
  sku_name: "P1v3",
});

const site = tf.resource("azurerm_linux_web_app", "web", {
  name: "app-web",
  resource_group_name: rg.attr("name"),
  location: rg.attr("location"),
  service_plan_id: plan.attr("id"), // OUTPUT(plan) -> INPUT(site)
  site_config: block({}), // required nested block
});

tf.output("default_hostname", { value: site.attr("default_hostname") });

const json = emitJson(tf);
console.log(json);

await Bun.write("out/main.tf.json", json);
