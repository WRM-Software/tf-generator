# Task task-3 Report

## Task
Implement `TfBuilder`, the Block B builder API (`terraform`/`provider`/`resource`/`data`/`variable`/`output`/`module`), on top of task 2's `IR`/`Addressable`/`Ref`.

## Outcome
done

## Notes
- New file: `src/TfBuilder.ts`, class `TfBuilder`.
- Internal IR is exposed to task 4 (Block C's `emitJson`) via a `readonly ir: IR` public
  property on the instance (initialized in a field initializer to the empty-array shape
  from `core-types.md`, e.g. `tf.ir.resource`, `tf.ir.provider`, etc.). No getter — it's a
  plain public field, matching `builder-api.md`'s `readonly ir: IR;` declaration. `IR` and
  `Addressable` themselves stay internal (not exported from `src/index.ts`); only the
  `TfBuilder` class will be exported in task 5.
- Traced usage-examples.md examples 1, 2, 4, 5 by hand against the implementation — all
  method calls (`resource`, `output`, `terraform`, `provider`, `variable`, `module`, plus
  `.attr()` chaining) match the signatures built here. Nothing was out of line.
- `bun run check` (`tsc -b`, strict) passes clean with no errors.
- No test script wiring needed yet (no `vitest run` requirement triggered — no tests added
  in this task, consistent with "Out of scope: Emitters — task 4").
