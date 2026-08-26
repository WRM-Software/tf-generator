# Task 1 — Purge CDKTF: delete old core, update package.json/tsconfig.json

## Goal

Clear the ground for the untyped Terraform-generation core. This task is deletion +
config housekeeping only — no new source code.

## Contract references

- `_contract/package-exports.md` → "package.json" and "Deletions" sections
- `_goal/_goal.md` → "Key decisions": tsconfig path alias rename

## Steps

1. Delete these files (old CDKTF-era core, superseded by Blocks A/B/C in later tasks):
   - `src/BlockComposer.ts`
   - `src/TerrakitStack.ts`
   - `src/Terrakit.ts`
   - `src/types.ts`
   - `src/internal/utils.ts` (remove the now-empty `src/internal/` dir too)
   - Replace `src/index.ts`'s contents with a minimal placeholder (e.g. `export {};`)
     — just enough that nothing references the deleted files. Task 5 replaces this
     placeholder with the real public exports; don't try to export anything real here.
2. Delete these old example dirs entirely:
   - `examples/basic`
   - `examples/cross-stacks`
   - `examples/merge-controller`
3. `package.json`:
   - Rename `"name"` from `"terrakit"` to `"@wrmsoftware/tf-generator"`.
   - Remove from `dependencies`: `cdktf`, `lodash.merge`, `zod`.
   - Remove from `devDependencies`: `@cdktf/provider-azurerm`, `@types/lodash.merge`,
     and `constructs` — note: the contract text says "remove `constructs` from
     dependencies," but in the actual file it's currently listed under
     `devDependencies`, not `dependencies`. Remove it from wherever it actually is.
   - Add to `devDependencies`: `vitest` (latest stable).
   - Add script: `"test": "vitest run"` (optionally also `"test:watch": "vitest"`).
   - Do NOT touch: `main`/`module`/`types`/`exports` (stay `dist/{cjs,esm,dts}`),
     the existing build chain scripts (`build`/`build-esm`/`build-cjs`/
     `build-annotate`/`check`/`format`), or `"version"` (stays `0.6.0` — version
     bumps are release-time only, not this milestone's concern).
   - Do NOT touch `repository`/`homepage` — out of contract scope for this task, even
     though they still point at the old `thaitype/terrakit` GitHub URL. Note this
     discrepancy in your task report as an observation, don't fix it silently.
4. `tsconfig.json`: rename the `paths` key `"terrakit": ["src/index.ts"]` to
   `"@wrmsoftware/tf-generator": ["src/index.ts"]`.

## Acceptance

- `src/` contains only `index.ts` (still the old CDKTF-era content for now — task 5
  rewrites it; don't touch its contents in this task).
- `examples/` no longer contains `basic`, `cross-stacks`, or `merge-controller`.
- `package.json` has no `cdktf`/`constructs`/`lodash.merge`/`zod`/`@cdktf/provider-azurerm`/
  `@types/lodash.merge` anywhere, has `vitest` as a devDependency, has a `test` script,
  and its `name` is `@wrmsoftware/tf-generator`.
- `tsconfig.json`'s path alias key matches the new package name.
- Per `.chief/_rules/_verification/build-and-test.md`: `bun run check` MUST pass
  before you commit (the `index.ts` placeholder is what makes this possible — an
  empty module compiles cleanly). `vitest run` isn't wired up yet (task 5 / a later
  task adds real tests) — skip it for this task only, since there's no test script
  target yet beyond what task 1 itself adds.
- Commit with a clear message once the deletions/config changes are done, and once
  `bun run check` is green.

## Out of scope

- Writing any new Block A/B/C source code (tasks 2–4).
- Fixing `src/index.ts`'s now-broken imports (task 5).
