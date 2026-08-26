# Task 9 — Cleanup: stale `get` script + `repository`/`homepage` URLs

## Goal

Fix two small discrepancies flagged during task 1's report (both explicitly out of
that task's contract scope at the time, deferred here):

1. Root `package.json`'s `"get": "cd examples/basic && bun get"` script references a
   deleted example directory (`examples/basic` was removed in task 1).
2. Root `package.json`'s `"repository"`/`"homepage"` fields still point at the old
   `https://github.com/thaitype/terrakit` URL, not the new org/repo
   (`WRM-Software/tf-generator`).

## Steps

1. Read `.chief/milestone-issue-16/_report/task-1-report.md` and
   `.chief/milestone-issue-16/_report/task-7-report.md` first for exact context (what
   the `get` script used to do, and what the new example's actual run command is).
2. Either update the `get` script to point at `examples/azurerm-webapp` with its actual
   run command, or remove the script entirely if it no longer makes sense as a
   top-level convenience script (your judgment — if you remove it, make sure nothing
   else references it, e.g. the Makefile's `examples` target, which takes the example
   name as an argument and isn't tied to the `get` script name specifically — check
   `Makefile` before deciding).
3. Update `"repository"` and `"homepage"` in `package.json` to point at
   `https://github.com/WRM-Software/tf-generator` (matching the actual GitHub repo this
   code lives in — confirm via `git remote -v` if you want to double check).

## Acceptance

- No remaining reference to `examples/basic` anywhere in `package.json`.
- `repository`/`homepage` point at `WRM-Software/tf-generator`.
- `bun run check` still passes (should be unaffected — this is package.json metadata +
  maybe a script string).
- Commit once done.

## Out of scope

- Any other package.json fields — don't touch `version`, build scripts, deps, etc.
  beyond what's described above.
