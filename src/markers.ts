import type { TfObject } from "./values.js";

/**
 * Contract — Core value model & IR (Block A) — "Markers" section.
 *
 * `Ref` and `Block` are detected via `instanceof` by emitters (Block C). The
 * `_tag` field is retained only as a discriminant for debugging/inspection,
 * not as the detection mechanism.
 */
export class Ref {
  readonly _tag = "ref" as const;
  constructor(readonly expr: string) {}
  toString(): string {
    return this.expr;
  }
}

export function ref(expr: string): Ref {
  return new Ref(expr);
}

/**
 * Forces HCL block syntax (vs map attribute) once `emitHcl` ships (deferred
 * this milestone) — currently a no-op marker for `emitJson`. An array body
 * means the block is repeated once per element.
 */
export class Block {
  readonly _tag = "block" as const;
  constructor(readonly body: TfObject | TfObject[]) {}
}

export function block(body: TfObject | TfObject[]): Block {
  return new Block(body);
}
