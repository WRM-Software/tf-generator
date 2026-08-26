import type { TfObject } from "./values.js";

/**
 * Contract — Core value model & IR (Block A) — "IR" section.
 *
 * INTERNAL — not exported from `src/index.ts`. Mirrors Terraform's own
 * top-level document structure so emitters (Block C) stay trivial. This
 * shape is an implementation detail, free to change in future milestones.
 */
export type NamedBlock = { type: string; name: string; body: TfObject }; // resource/data
export type LabelBlock = { name: string; body: TfObject }; // provider/variable/output/module

export interface IR {
  terraform?: TfObject;
  provider: LabelBlock[];
  resource: NamedBlock[];
  data: NamedBlock[];
  variable: LabelBlock[];
  output: LabelBlock[];
  module: LabelBlock[];
}
