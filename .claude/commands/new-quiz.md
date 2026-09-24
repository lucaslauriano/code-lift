---
description: Create quiz questions on a topic
argument-hint: <topic> <count>
---

Use the `content-author` agent to create `$2` quiz questions on `$1` under
`packages/content/quiz/$1/`.

One `.mdx` per question. Frontmatter carries `topic`, `format` (`mcq` or `open`), `options` and
`answerIndex` for multiple choice, or `answer` for open questions. The body is the explanation —
and the explanation is the product, so write the _why_, not a restatement of the answer.

Prefer questions whose wrong options are plausible. A multiple choice with three obvious throwaways
teaches nothing.

Validate with `pnpm content:validate` when quiz validation exists (phase 3); until then, check the
frontmatter parses and report what you created.
