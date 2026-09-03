# Task task-4 Report

## Task
Implement `emitJson(tf: TfBuilder): string` (Block C emitter) — encode the IR into
pretty-printed Terraform JSON, per `_contract/emitters.md`.

## Outcome
done

## Notes
- `emitJson` lives at `src/emitJson.ts`, exported as `export function emitJson(tf: TfBuilder): string`.
  Not yet wired into `src/index.ts` — that's task 5. Task 5 should re-export both
  `TfBuilder` (from `src/TfBuilder.ts`) and `emitJson` (from `src/emitJson.ts`), plus
  `ref`/`block` from `src/markers.ts`, per usage-examples.md's import surface
  (`import { TfBuilder, emitJson } from "@wrmsoftware/tf-generator"`, and
  `import { block, ref, ... } from "@wrmsoftware/tf-generator"` in later examples).
- Internal helpers `encodeValue`/`encodeObject` are not exported — only `emitJson` is
  the public surface from this file.
- Empty IR groups (e.g. no `provider`/`data`/`variable`/`module` entries) are omitted
  from the output document entirely rather than emitted as `{}` — this matches
  usage-examples.md example 1's shown output exactly (no empty keys present).
- Manually traced usage-examples.md example 1 (minimal: one resource + output) by
  running it through the actual implementation (`bun` script importing
  `TfBuilder`/`emitJson`). Output matched the documented "Emits (JSON, shape)" block
  exactly, key-for-key and value-for-value (only cosmetic difference is
  `JSON.stringify(..., null, 2)`'s multi-line formatting vs. the compact block in the
  doc — structurally identical).
- `bun run check` (`tsc -b`, strict) passes clean.
- Per commit-scope precedent set by tasks 1-3, only `src/emitJson.ts` was staged and
  committed; `.chief/` plan/report files remain untracked (consistent with prior task
  commits, which touched only `src/`).
