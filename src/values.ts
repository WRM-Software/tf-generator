import type { Ref, Block } from "./markers.js";

/** Contract — Core value model & IR (Block A) — "Value model" section. */
export type TfPrimitive = string | number | boolean | null;
export type TfValue = TfPrimitive | Ref | Block | TfValue[] | TfObject;
export interface TfObject {
  [key: string]: TfValue;
}
