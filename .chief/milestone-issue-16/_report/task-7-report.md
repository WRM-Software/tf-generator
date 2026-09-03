# Task task-7 Report

## Task
Create `examples/azurerm-webapp`, the milestone's flagship example: an azurerm
resource-group -> service-plan -> Linux web-app program authored with the
untyped core, emitting `.tf.json`, with its own package.json/README.

## Outcome
done

## Decision
- **Issue:** A concurrently-running builder-agent (task 6) staged and committed
  `examples/azurerm-webapp/*` alongside its own `src/emitJson.test.ts` changes
  (shared working tree, index race — both agents run in the same repo
  checkout). Commit `bf14e64` ended up containing both task 6's test files and
  my in-progress example files under task 6's commit message.
- **Options considered:**
  - Rewrite/split `bf14e64` myself (destructive, and not my commit to rewrite
    while another agent might still be active).
  - Leave it as-is and only note the mislabeling in this report.
  - Wait for/let the other agent's own cleanup resolve it.
- **Chosen:** The other agent noticed the same race and pushed a follow-up
  commit `df1d55f` ("chore(milestone-issue-16/task-6): drop
  examples/azurerm-webapp from task-6 commit") that untracked the example
  files via `git rm --cached` without touching them on disk. I picked up from
  there, re-staged only `examples/azurerm-webapp/{package.json,bun.lock,
  src/main.ts,README.md}`, and committed them under this task's own message.
  No file content was lost or altered; only commit attribution was corrected.

## Notes
1. **Local dependency resolution:** `file:` protocol. In
   `examples/azurerm-webapp/package.json`:
   `"@wrmsoftware/tf-generator": "file:../.."`. Because `main`/`module`/`types`
   point at `dist/{cjs,esm,dts}`, the root package must be built first (`bun
   run build` from repo root) before `bun install` inside the example — noted
   in the example README. No workspace/monorepo restructuring was needed.
2. **Exact run command:** from `examples/azurerm-webapp/`, after `bun install`:
   `bun run start` (script: `"start": "bun run src/main.ts"`). Full sequence
   from a clean clone: `bun run build` (repo root) -> `cd
   examples/azurerm-webapp && bun install && bun run start`. This prints the
   emitted JSON to stdout and writes it to `out/main.tf.json`.
3. **`terraform validate`:** ran successfully. `terraform` v1.15.9 was
   available in this environment. Ran `terraform -chdir=out init
   -backend=false` (downloaded `hashicorp/azurerm` ~> 4.0, resolved 4.81.0),
   then `terraform -chdir=out validate` -> `Success! The configuration is
   valid.` `out/` (including the `.terraform`/lock-file artifacts from `init`)
   is git-ignored via the repo's existing bare `out` pattern in root
   `.gitignore` (originally a Next.js-output rule, but it matches any
   directory literally named `out` anywhere in the tree) — nothing under
   `out/` was committed.

## Verification
- `bun run check` (root, `tsc -b tsconfig.json`) passes with the new
  `examples/azurerm-webapp/src/main.ts` present (verified with a fresh
  `tsconfig.tsbuildinfo`, and cross-checked with `--listFiles` that the file
  is included and type-checks cleanly against the `@wrmsoftware/tf-generator`
  path-mapped alias to `src/index.ts`).
- `package.json` for the example has no `cdktf`/`constructs`, only
  `@wrmsoftware/tf-generator` (dependency) and `@types/bun` (devDependency).
- Example actually runs (`bun run start`) and produces valid-looking
  `.tf.json` matching contract usage-example 2's shape exactly.
