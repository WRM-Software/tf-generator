# Verification gate — build & test

Before any commit, builder-agent MUST run and require green:

- `bun run check` (`tsc -b`, `strict` mode)
- `vitest run` (once a milestone adds the `test` script to `package.json`; not
  applicable before that)

This is a standing rule across milestones, not specific to one goal doc. Do not commit
if either fails — fix first, or escalate if the failure isn't something builder-agent
can resolve on its own.
