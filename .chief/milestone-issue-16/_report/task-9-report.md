# Task task-9 Report

## Task
Clean up two stale `package.json` discrepancies flagged in task-1's report: the
`get` script referencing the deleted `examples/basic` dir, and the
`repository`/`homepage` URLs still pointing at the old `thaitype/terrakit` repo.

## Outcome
done

## Notes
- `get` script changed from `"cd examples/basic && bun get"` to
  `"cd examples/azurerm-webapp && bun install && bun run start"` — the actual
  flagship example dir and its real run command (per task-7's report; the
  example has no `get` script of its own, just `start`). Assumes the root has
  already been built (`bun run build`) first, same prerequisite noted in the
  example's own README — not something this task's scope covers fixing.
- `repository.url` and `homepage` updated from
  `https://github.com/thaitype/terrakit(.git)` to
  `https://github.com/WRM-Software/tf-generator(.git)`, confirmed against
  `git remote -v` (origin already points there).
- Checked `Makefile`: its `examples` target (`cd examples/$(word 2,...) && bun
  install && bun run $(word 3,...)`) is a generic runner keyed by directory
  name and command, not tied to the `get` script name — left untouched, no
  changes needed there.
- Verified no remaining references to `examples/basic` anywhere in
  `package.json` (grepped for it — none). `bun run check` (`tsc -b`) passes
  clean, unaffected by this change as expected.
- Committed as `9b3d855`, scoped to `package.json` only. Did not touch
  `README.md` per the concurrent task-8 boundary.
- This is the last task in batch 2. Cross-checking milestone success criteria
  in `_goal/_goal.md`: criteria 1 (CDKTF gone), 2 (core compiles), 3 (emitJson
  works), 5 (tests green), and 6 (public API surface) look satisfied based on
  tasks 1–7's reports. Criterion 4 (example runs + `terraform validate`) was
  verified done in task-7's report. However, task-8 (README rewrite, "no
  Backed by CDKTF") was still in progress concurrently with this task and has
  no report file yet as of this writing — that's the one remaining open item
  before the milestone as a whole can be called fully done. Worth confirming
  task-8 landed cleanly before closing out the milestone.
