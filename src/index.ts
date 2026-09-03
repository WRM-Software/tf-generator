/**
 * Contract — Public API surface & packaging — "src/index.ts exports (exact
 * set)" section.
 *
 * MUST export: `TfBuilder`, `ref`, `Ref`, `block`, `Block`, `emitJson`,
 * `TfPrimitive`, `TfValue`, `TfObject`.
 *
 * MUST NOT export: `IR` (and its `NamedBlock`/`LabelBlock` helpers),
 * `Addressable`. Both stay internal to Block B/emitJson wiring.
 */
export { TfBuilder } from "./TfBuilder.js";
export { Ref, ref, Block, block } from "./markers.js";
export { emitJson } from "./emitJson.js";
export type { TfPrimitive, TfValue, TfObject } from "./values.js";
