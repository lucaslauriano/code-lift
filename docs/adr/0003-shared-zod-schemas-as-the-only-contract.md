# 0003. Shared zod schemas as the only contract

- **Status:** accepted
- **Date:** 2026-09-23

## Context

A Nest API and a Next app each need to know the shape of every request and response. The default
path gives you three definitions of the same thing: class-validator DTOs in the API, TypeScript
interfaces in the web app, and whatever the database returns. They drift, and the drift shows up as
a runtime error in production rather than a type error at build.

## Decision

`packages/shared` defines every contract as a zod schema. The API validates with those schemas
through a small `ZodValidationPipe`; the web app derives its types from the same schemas. No
class-validator DTOs.

## Consequences

**Easy.** One definition per contract. A field renamed in `shared` breaks both sides at compile
time, which is when you want to hear about it. Validation messages are identical on both ends, so
client-side pre-validation and server-side rejection agree.

**Hard.** Swagger loses the automatic schema generation that class-validator decorators provide;
endpoints are documented by hand with `@ApiOperation`. Worth it — hand-written summaries are more
useful than generated ones anyway.

`packages/shared` must build before anything that imports it, which Turborepo handles but which
makes a cold `typecheck` slower than it would otherwise be.

## What would make us revisit

Nothing foreseeable. The failure mode this prevents — a contract that differs between the two
halves of the app — is the single most common source of bugs in a split frontend/backend codebase.
