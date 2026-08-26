# Concurrent builder-agent tasks — git staging discipline

When 2+ builder-agent tasks are delegated to run concurrently in the same
(non-worktree) working tree, each task's brief MUST require:

1. **Strict scope** — stay only within the files/directories assigned to that
   task. State explicitly in the prompt which other task(s) are running
   concurrently and what they own, so the agent knows what NOT to touch.
2. **Scoped staging, always** — use `git add <specific files>`, never
   `git add -A` / `git add .`. Immediately before committing, run
   `git status` and `git diff --cached --stat` and confirm only this task's
   own files are staged.
3. **Prefer `isolation: 'worktree'`** for concurrent tasks with non-trivial
   write-conflict risk (e.g. both tasks create new files/dirs, or the repo
   has no clear directory boundary between them). Isolation costs setup time
   but removes the staging-race risk entirely.

## Why

Two builder-agents running concurrently in the same working tree can race on
`git`'s index: one agent's broad staging can sweep up another's in-progress,
uncommitted files into its own commit. This happened once (milestone-16,
tasks 6 & 7) — no data was lost only because both agents happened to notice
and self-correct (one force-untracked the accidentally-committed files via
`git rm --cached`, the other re-committed them under the correct task). That
was good agent behavior, not a guarantee the process provides on its own —
don't rely on it happening again.
