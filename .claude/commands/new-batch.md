---
description: Create several varied algorithm questions on one topic
argument-hint: <count> <topic>
---

Use the `content-author` agent to create `$1` new algorithm questions on the topic `$2`.

1. List the existing slugs first (`ls packages/content/questions/algo`) and do not repeat any, nor
   create two questions in this batch that reduce to the same trick.
2. Spread the difficulties rather than producing `$1` easy ones.
3. Follow the full format for each: six files, 6 public / 8 hidden / 2 performance cases, an optimal
   commented reference solution, and an editorial ending with what the Toptal evaluator is actually
   measuring.
4. Run `pnpm content:validate` once at the end and fix everything it reports.
5. Report a table of slug, difficulty, and the discriminating idea of each question.
