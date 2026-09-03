# Task task-6 Report

## Task
Write `vitest` unit tests covering `emitJson`'s encoding rules and document assembly,
satisfying success criterion 5 in `_goal/_goal.md`.

## Outcome
done

## Notes

All 6 coverage areas from the task spec are tested in `src/emitJson.test.ts`:

1. **Ref encoding** — covered (`"encodes a Ref as a ${expr} string"`): asserts
   `resource(...).attr("id")` renders as `"${azurerm_resource_group.main.id}"` in an
   output, plus a standalone `ref()` escape-hatch case.
2. **`Block` no-op behavior** — covered (`"treats Block as a no-op..."`): asserts
   `block({...})`-wrapped body produces byte-identical `emitJson` output to the same
   body passed without `block()`, and that an array-bodied `block([...])` encodes as
   an array of encoded objects.
3. **`dynamic`-block passthrough** — covered (`"passes a dynamic block through
   structurally unchanged..."`): asserts the exact nested `dynamic.ip_restriction`
   shape survives `emitJson`, including a `Ref` inside `content`.
4. **`module()` wiring** — covered (`"wires module() as an Addressable..."`): asserts
   `tf.module(...).attr(x)` renders as `"${module.web_app.x}"`, and that `body.source`
   (a local relative path string) passes through as a plain string.
5. **Array/object nesting** — covered (`"recursively encodes nested arrays and
   objects..."`): mixed primitives, refs, and plain objects nested inside arrays and
   objects, asserted via `toEqual` on the full decoded structure.
6. **Full-program snapshot** — covered (`"emits a full multi-resource program matching
   the flagship usage example"`): mirrors usage-examples.md example 2's shape
   (resource group → service plan → linux web app, `terraform`/`provider` blocks using
   `block()`) and asserts via `toMatchSnapshot()`.

Verification: `bun run check` (tsc -b, strict) and `bun run test` (`vitest run`) both
pass — 6/6 tests green, 1 snapshot written to `src/__snapshots__/emitJson.test.ts.snap`.

Note on formatting: `.prettierrc.json` specifies `singleQuote: true`, which conflicts
with the double-quote style already present in all existing `src/*.ts` files (added in
tasks 1-5, apparently never run through this prettier config). The editor's
format-on-save also reformatted those pre-existing files to single quotes as a side
effect of this session; those changes were reverted (`git checkout --`) to keep this
commit scoped to the new test file only. The new test file follows the active
`.prettierrc.json` config (single quotes) since it's genuinely new code, not a
pre-existing style to preserve.
