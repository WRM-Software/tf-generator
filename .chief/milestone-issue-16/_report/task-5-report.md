# Task task-5 Report

## Task
Replace the placeholder `src/index.ts` with the real public export surface (`TfBuilder`,
`Ref`/`ref`, `Block`/`block`, `emitJson`, `TfPrimitive`/`TfValue`/`TfObject`), keeping `IR`
and `Addressable` unexported.

## Outcome
done

## Notes
- `src/index.ts` now re-exports exactly the 9 contracted names, nothing else — verified
  two ways: (1) `bun run` of a scratch script printing `Object.keys(await import(...))`
  returned exactly `["Block", "Ref", "TfBuilder", "block", "emitJson", "ref"]` (the 3 types
  are erased at runtime as expected, bringing the total to 9); (2) a scratch `import { IR }
  from "./src/index.ts"` fails `tsc --noEmit` with `TS2305: has no exported member 'IR'`,
  confirming `IR` isn't reachable via any re-export chain. `Addressable` was never
  referenced in `index.ts` at all. All scratch files were deleted after verification —
  `git status` shows only `src/index.ts` changed.
- `bun run check` (`tsc -b`, strict) passes clean with zero errors.
- `bun run test` (`vitest run`) currently exits 1 with "No test files found" — this is
  expected and out of scope for task 5 (unit tests are explicitly deferred to a later
  batch per the task spec's "Out of scope" section and the goal doc's success criterion 5).
  The `test` script and `vitest` devDependency were already wired in task 1's package.json
  changes; only the test *files* are missing, which is next batch's job.
- This closes out batch 1 (tasks 1–5, Blocks A/B/C spine). `bun run check` passes cleanly
  end-to-end across the whole package now that `index.ts` wires everything together —
  this satisfies success criterion 2 ("Core compiles") and success criterion 6 ("Public
  API is the intended surface") from `_goal/_goal.md`.
- Carrying into next batch: vitest unit tests (ref encoding, `Block` no-op, `dynamic`
  passthrough, `module()` wiring incl. `Addressable.attr()`, array/object nesting, full
  snapshot), the `examples/azurerm-webapp` example (+ its own `package.json` depending
  only on `@wrmsoftware/tf-generator`), and the root README rewrite. None of these were
  touched here, consistent with task 5's "Out of scope" list.
- Did not re-verify `package.json` dependency cleanup (cdktf/constructs/zod/lodash.merge
  removal) or the old-file/example deletions from the contract — those were task 1's
  responsibility and outside this task's diff; not re-checked here since out of scope for
  task 5's assignment.
