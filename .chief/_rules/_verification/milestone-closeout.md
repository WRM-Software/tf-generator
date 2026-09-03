# Milestone closeout — goal-doc wording cross-check

Before declaring a milestone done, in addition to verifying every numbered
success criterion, re-read `_goal/_goal.md`'s "In scope" (and any other
prose) bullets literally against what was actually built. Fix any stray
overstatement or inaccuracy found — don't leave the goal doc claiming
something that isn't true of the shipped result.

## Why

Numbered success criteria can all pass while a *descriptive* claim elsewhere
in the goal doc quietly stops being true — e.g. a bullet promising a feature
is demonstrated "in the flagship example and a unit test" when only the unit
test ends up covering it. This was found once (milestone-16) during a final
manual pass, not by any automated check — it's cheap to catch with a
deliberate read-through, easy to miss if you only check checkboxes.
