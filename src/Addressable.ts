import { Ref } from "./markers.js";

/**
 * Contract — Core value model & IR (Block A) — "Addressable" section.
 *
 * INTERNAL — not exported from `src/index.ts`. Returned by referenceable
 * builder methods (`resource`, `data`, `module`). Callers (Block B) are
 * responsible for constructing the `address` correctly: `data` addresses are
 * prefixed with `data.`; `module` addresses are `module.<name>` (so
 * `.attr(x)` on a module's `Addressable` yields `module.<name>.<x>`).
 */
export class Addressable {
  constructor(readonly address: string) {}

  attr(path: string): Ref {
    return new Ref(`${this.address}.${path}`);
  }
}
