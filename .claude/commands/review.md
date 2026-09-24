---
description: Review the current diff against main
---

Run the `code-reviewer` agent on the current working diff.

1. `git diff main...HEAD --stat` and `git diff main...HEAD` (fall back to `git diff HEAD` if there
   is no `main` yet).
2. Review against the checklist in the agent definition: sandbox isolation first, then edge-case
   correctness, contract drift, N+1 queries, Nest DI type-import erasure, accessibility, dead code.
3. Report one finding per issue with file, line, and the concrete input or state that breaks.
4. Say plainly if the diff is fine.
