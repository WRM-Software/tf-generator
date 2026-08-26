import type { TfObject, TfValue } from "./values.js";
import { Ref, Block } from "./markers.js";
import type { TfBuilder } from "./TfBuilder.js";

/**
 * Contract — Emitters (Block C) — `emitJson` encoding rules + document assembly.
 *
 * Encoding rules:
 * - `Ref` -> string `"${expr}"`.
 * - `Block` -> its underlying object/array, marker dropped (no-op beyond
 *   unwrapping — no HCL logic here).
 * - array -> recursively encoded array.
 * - object (`TfObject`) -> recursively encoded object. A `dynamic` key needs
 *   zero special-case code — it's just another nested `TfObject`.
 * - primitives (`string`/`number`/`boolean`/`null`) -> as-is.
 */
function encodeValue(value: TfValue): unknown {
  if (value instanceof Ref) {
    return `\${${value.expr}}`;
  }
  if (value instanceof Block) {
    return encodeValue(value.body);
  }
  if (Array.isArray(value)) {
    return value.map(encodeValue);
  }
  if (value !== null && typeof value === "object") {
    return encodeObject(value);
  }
  return value;
}

function encodeObject(obj: TfObject): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    out[key] = encodeValue(obj[key] as TfValue);
  }
  return out;
}

/**
 * Contract — Emitters (Block C) — document assembly.
 *
 * Reads `TfBuilder`'s internal IR and produces pretty-printed Terraform JSON
 * (`.tf.json`). `emitHcl` is deferred to a later milestone.
 *
 * Known limitation (see `_contract/emitters.md`): `provider[]` assembly here
 * assumes one provider config per name (no aliasing this milestone) — a
 * later milestone must switch this to array-based assembly to support
 * `alias`.
 */
export function emitJson(tf: TfBuilder): string {
  const ir = tf.ir;
  const doc: Record<string, unknown> = {};

  if (ir.terraform) {
    doc.terraform = encodeObject(ir.terraform);
  }

  if (ir.provider.length > 0) {
    const provider: Record<string, unknown> = {};
    for (const { name, body } of ir.provider) {
      provider[name] = encodeObject(body);
    }
    doc.provider = provider;
  }

  if (ir.resource.length > 0) {
    const resource: Record<string, Record<string, unknown>> = {};
    for (const { type, name, body } of ir.resource) {
      resource[type] ??= {};
      resource[type][name] = encodeObject(body);
    }
    doc.resource = resource;
  }

  if (ir.data.length > 0) {
    const data: Record<string, Record<string, unknown>> = {};
    for (const { type, name, body } of ir.data) {
      data[type] ??= {};
      data[type][name] = encodeObject(body);
    }
    doc.data = data;
  }

  if (ir.variable.length > 0) {
    const variable: Record<string, unknown> = {};
    for (const { name, body } of ir.variable) {
      variable[name] = encodeObject(body);
    }
    doc.variable = variable;
  }

  if (ir.output.length > 0) {
    const output: Record<string, unknown> = {};
    for (const { name, body } of ir.output) {
      output[name] = encodeObject(body);
    }
    doc.output = output;
  }

  if (ir.module.length > 0) {
    const module: Record<string, unknown> = {};
    for (const { name, body } of ir.module) {
      module[name] = encodeObject(body);
    }
    doc.module = module;
  }

  return JSON.stringify(doc, null, 2);
}
