---
description: Create a complete algorithm question and validate it
argument-hint: <slug> <easy|medium|hard> <topic>
---

Use the `content-author` agent to create a new algorithm question.

**Slug:** `$1` · **Difficulty:** `$2` · **Topic:** `$3`

Steps:

1. Check that `packages/content/questions/algo/$1` does not already exist, and that `$3` is a value
   in `topicSchema` (`packages/shared/src/enums.ts`). If the topic is not there, stop and ask —
   adding to the enum is a deliberate decision, not a side effect.
2. Create all six files in `packages/content/questions/algo/$1/`.
3. At least 6 public, 8 hidden and 2 performance cases. Build each performance input and its
   expected answer by construction, not by running a second implementation.
4. Run `pnpm content:validate` and fix anything it reports.
5. Report the case counts and the slowest performance case timing.
