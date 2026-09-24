# 0002. Content lives in git, not in the database

- **Status:** accepted
- **Date:** 2026-09-23

## Context

Questions have a statement, a starter, a reference solution, test cases and an editorial. Stored in
Postgres they would be rows to be edited through an admin UI nobody wants to build, with no diffs,
no review, and no way to tell whether a solution still passes its own cases.

## Decision

`packages/content` holds questions as files. `content:sync` writes only metadata (slug, title,
difficulty, topics, a content hash) into Postgres so the API can filter and join against user
progress. The database never holds a statement, a solution or a test case.

A question is only synced if its reference solution passes every case it ships, run through the
same transpile/evaluate path a user submission takes.

## Consequences

**Easy.** Questions are reviewed like code. A broken question fails CI. The content hash makes sync
idempotent. The validator is a real test, not a schema check — it executes the solution.

**Hard.** Adding a question requires a deploy. `cases.ts` has to be _evaluated_ rather than parsed,
because a 100k-element performance input can only be expressed as code — so content is trusted code
by construction, and a mistake there runs at sync time.

A question deleted from disk is not deleted from the database: its submissions are the user's
history. Sync warns instead.

## What would make us revisit

Wanting to author questions from inside the app. That is a product feature, and it would mean the
database becomes a second source of truth — at which point the validator guarantee disappears.
