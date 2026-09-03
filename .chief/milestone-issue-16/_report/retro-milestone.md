# Retro: milestone-issue-16 — milestone

## Coverage Check

| File | Status | Notes |
|------|--------|-------|
| `_goal/_goal.md` | ✅ Satisfied | All 6 success criteria verified independently (not just from task self-reports): CDKTF traces zero (grepped `src/`, `examples/`, `package.json`, excluding `node_modules`); `bun run check` clean; `emitJson` correct via unit tests + real example; `terraform validate` actually run and passed (`terraform` v1.15.9); 6/6 vitest tests covering all required areas; `src/index.ts` export set confirmed exact via a `tsc` negative-check on `IR`. |
| `_contract/core-types.md` | ✅ Satisfied | `Ref`/`Block`/`TfValue`/`TfObject`/`IR`/`Addressable` match the contract's exact shape (task-2, spot-checked directly). |
| `_contract/builder-api.md` | ✅ Satisfied | All 7 `TfBuilder` methods match the table exactly — no scope creep (no `count`/`for_each`, no indexed `module` addressing), spot-checked directly against `src/TfBuilder.ts`. |
| `_contract/emitters.md` | ✅ Satisfied, with a gap the contract itself didn't cover | Encoding rules + document assembly match exactly, including the intentionally-deferred provider-aliasing limitation. But: the contract never addressed key-safety — CodeQL later found a real prototype-pollution vulnerability (`js/prototype-polluting-assignment`) in the `resource[type][name]`/`data[type][name]` assembly that neither the contract nor the unit-test task anticipated. Fixed post-milestone-completion (commit `0d52219`), not something the original spec asked for. |
| `_contract/package-exports.md` | ✅ Satisfied | Export set, `package.json` changes, deletions, new example — all delivered. Task 9 additionally cleaned up two discrepancies (`get` script, `repository`/`homepage` URLs) that were *flagged* by task-1 but not literally required by any contract line — reasonable judgment-call cleanup, not scope creep. |
| `_contract/usage-examples.md` | ✅ Satisfied | Examples 1-4 and the flagship (2) are directly exercised by the real example + unit tests. Example 5 (modules) is deliberately validated only via a unit test, not a second `examples/` dir — consistent with `package-exports.md` mandating exactly one new example directory. |

## Planned vs Delivered

- **Batch 1** (5 tasks: purge, Block A, Block B, Block C, public exports) — delivered exactly as planned, no scope changes mid-batch.
- **Batch 2** (4 tasks: unit tests, flagship example, README, cleanup) — delivered exactly as planned.
- **Not in the original plan, added afterward at the user's direct request:**
  - Fix for `scripts/clean-examples.sh` (stale CDKTF glob patterns, missing the new example's `out/` dir) — flagged during task-8 as a non-blocking follow-up, fixed on request in a standalone commit (`4b7e6fe`).
  - A GitHub Actions PR-preview workflow (`pkg.pr.new`) — entirely outside this milestone's contract, added because the user wanted CI publishing set up (`e04e6bd`).
  - A prototype-pollution security fix in `emitJson.ts`, driven by a CodeQL finding on the opened PR, not by anything in `_goal/` or `_contract/` (`0d52219`).
- Nothing planned was skipped or dropped.

## Blockers Hit

1. **Concurrent-agent file-staging race (tasks 6 & 7).** Both ran in parallel in the *same* working tree (not isolated git worktrees). Task 6's builder-agent broadly staged files and accidentally swept up task 7's in-progress `examples/azurerm-webapp/*` into its own commit (`bf14e64`). Task 6's agent detected this itself and pushed a follow-up (`df1d55f`, `git rm --cached` only, no disk changes) before task 7 picked up and committed its files cleanly under the right message. No data was lost, but this worked because both agents happened to double-check their staging before finalizing — not because the process guaranteed it. The prompts told each agent "don't touch the other's files," which is necessary but not sufficient against a `git add`-scope race.
2. **GitHub PAT missing `workflow` scope.** Pushing the new `.github/workflows/pr-preview.yml` was rejected — GitHub blocks PAT-based pushes to workflow files unless the token has explicit `workflow` permission. The account used for pushing had a fine-grained PAT without it. Resolved by asking the user to add that permission on GitHub directly, then retrying the push — not something fixable from the CLI/agent side.
3. **CodeQL caught a real vulnerability class the contract never addressed.** `resource[type][name] = ...` (and the identical `data[...]` pattern) let a `type`/`name` of `"__proto__"` reach the real `Object.prototype` via the inherited accessor, polluting it process-wide. Neither `_contract/emitters.md` nor the unit-test task spec mentioned key-safety against untrusted type/name strings — this was purely a post-hoc catch by automated security scanning on the opened PR.

## Lessons Learned

- **Contract-first paid off.** Across all 9 tasks, zero genuine design-ambiguity escalations were needed — every builder-agent had enough precision in its contract to work autonomously and correctly. This validates the heavy spec-editing work (TerraKit→TfBuilder rename, HCL drop, dynamic-blocks scoping, for_each disambiguation, module gap) done *before* any code was written.
- **Chief-level independent verification caught nothing wrong, but is still the right discipline.** Every task's builder-agent self-verified (ran `check`/`test`, traced usage examples by hand) before reporting done, and I independently re-read the actual produced code against each contract rather than trusting the self-report alone. All reports turned out accurate this time — but that's a reason to keep the habit, not to skip it next time.
- **Parallelizing write-heavy tasks in a shared (non-worktree) working tree is a real risk**, even with explicit "stay in your lane" instructions in the prompt. It worked out here due to good agent-side git hygiene (checking `git status`/`git diff --cached` before committing), not because the setup prevented the race.
- **Goal-doc prose can drift from what actually got built**, independent of whether numbered success criteria pass. Found one stray overstatement myself during final cross-check (the "Dynamic blocks: covered by the flagship example and a unit test" line — only the unit test ever covered it) — worth a deliberate final pass over the goal doc's literal wording, not just its checkbox criteria.
- **Automated security scanning (CodeQL) surfaced a class of issue the human-authored contract never considered** — object-key safety against untrusted type/name strings. This is generic to any codegen library building type/name-keyed maps, and will recur in Block D/E and any future `emitHcl` work touching the same assembly pattern.

## Proposed Rule Updates

1. **What:** Any code that builds a plain-object map keyed by external/library-input strings (resource type, resource name, module name, etc.) must use a null-prototype accumulator (`Object.create(null)`) rather than a bare `{}` object literal, to prevent prototype pollution (CWE-1321).
   **Where:** `.chief/_rules/_standard/security.md` (new file)
   **Why:** CodeQL caught two live instances of this in `emitJson.ts` that neither the contract nor the unit-test task anticipated; the same pattern will recur in Block D/E and future `emitHcl` work.
   **Suggestion:** recommended — cheap, closes a whole class of future findings before they happen.

2. **What:** When delegating 2+ builder-agent tasks to run concurrently in the same (non-worktree) working tree, each task's prompt must explicitly require: (a) strict scope to its own files/directories, and (b) checking `git status`/`git diff --cached --stat` immediately before committing — no broad `git add -A`/`git add .`. Use `isolation: 'worktree'` when write-conflict risk is non-trivial.
   **Where:** `.chief/_rules/_standard/concurrent-tasks.md` (new)
   **Why:** the task-6/task-7 staging race worked out by luck (agent-side diligence), not by process guarantee.
   **Suggestion:** recommended — formalizes what already worked into an explicit expectation instead of relying on it happening again.

3. **What:** Before closing out a milestone, re-read `_goal.md`'s "In scope" bullets literally against what was actually built — not just whether numbered success criteria pass — and fix any stray overstatements found.
   **Where:** `.chief/_rules/_verification/milestone-closeout.md` (new)
   **Why:** caught exactly one such drift this milestone; cheap to check, easy to miss if you only check numbered criteria.
   **Suggestion:** recommended, lower priority than 1/2.

## User Action Needed

- Decide whether to adopt rule proposals 1–3 above.
- No uncovered goals/contracts remain — no further batch needed for this milestone.
- `scripts/clean-examples.sh` staleness and the `file:../..` local-only dependency were both already addressed/accepted out-of-band; no further action needed on either.
