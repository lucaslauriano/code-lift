---
description: Run every gate and propose a commit
---

Run the full gate, then propose (do not make) a commit.

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm content:validate
```

If anything fails, fix it and run again — do not propose a commit over a red gate, and do not
report success for a step that did not run.

Then:

1. `git status --short` and `git diff --stat` to see what is actually staged and unstaged.
2. Propose a Conventional Commits message. The subject says what changed; the body says _why_, and
   names any trade-off a future reader would otherwise have to rediscover.
3. Wait for approval before committing.
