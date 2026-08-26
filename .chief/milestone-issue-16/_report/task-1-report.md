# Task task-1 Report

## Task

Purge the old CDKTF-era core (`src/`, three example dirs) and update
`package.json`/`tsconfig.json` config to clear the ground for the new
untyped Terraform-generation core.

## Outcome

done

## Notes

- Deleted `src/BlockComposer.ts`, `src/TerrakitStack.ts`, `src/Terrakit.ts`,
  `src/types.ts`, `src/internal/utils.ts` (and the now-empty `src/internal/`
  dir), and all three old example dirs (`examples/basic`,
  `examples/cross-stacks`, `examples/merge-controller`). `src/index.ts` is
  now just `export {};` — a placeholder for task 5 to replace with the real
  public exports (`TfBuilder`, `ref`, `Ref`, `block`, `Block`, `emitJson`,
  `TfPrimitive`, `TfValue`, `TfObject`).
- `package.json`: renamed to `@wrmsoftware/tf-generator`; removed `cdktf`,
  `lodash.merge`, `zod` from `dependencies`; removed
  `@cdktf/provider-azurerm`, `@types/lodash.merge`, and `constructs` (it was
  actually under `devDependencies`, not `dependencies`, confirming the
  contract text's note about that discrepancy) from `devDependencies`; added
  `vitest` (`^3.2.4`, latest stable at install time) as a devDependency plus
  `test`/`test:watch` scripts. Left `main`/`module`/`types`/`exports`,
  the build chain scripts, and `version` (`0.6.0`) untouched, as instructed.
  Ran `bun install` to sync `bun.lock` with the dependency changes.
- `tsconfig.json`: renamed the `paths` key from `"terrakit"` to
  `"@wrmsoftware/tf-generator"`.
- `bun run check` (`tsc -b`) passes clean with no errors — verified after
  `bun install`. `vitest run` intentionally skipped per the task's own
  verification note (no test script target existed for it to check against
  beyond what this task adds, and no tests exist yet).
- **Observation carried over from the task spec, not fixed here (out of
  contract scope for task-1):** `package.json`'s `repository`/`homepage`
  fields still point at the old `https://github.com/thaitype/terrakit`
  GitHub URL, not the new `@wrmsoftware/tf-generator` / `WRM-Software`
  org/repo. This is a real discrepancy a future task or milestone should
  address if the package is meant to be published under the new name/org.
- The old `get` script (`"cd examples/basic && bun get"`) now references a
  deleted example dir. It was in the pre-existing "build chain scripts" set
  the task told me not to touch, so I left it as-is — flagging here in case
  task 5 or a later task wants to clean it up (it will fail if invoked, but
  it's not part of `check`/`build`/`test` so it doesn't block anything).
- For task 2 (Block A value model/IR in new source files): `src/` is now
  empty except for the placeholder `index.ts`; `src/internal/` was removed
  entirely, so if the IR needs an internal-only location, that directory
  will need to be recreated.
