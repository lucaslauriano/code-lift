# 0001. Execute user code in the browser only

- **Status:** accepted
- **Date:** 2026-09-23

## Context

The app runs code the user writes. The obvious architecture — POST the code to the API, run it,
return results — means arbitrary code execution on the server. Even for a single-user personal app
that is a bad foundation: it makes the API the most dangerous surface in the system, and it is the
one decision that becomes impossible to reverse once features depend on it.

## Decision

User code runs only in the browser: a Web Worker for algorithms and JS functions, a sandboxed
iframe (Sandpack) for UI coding. The backend receives results — code, counts, timings — never
executes them.

A fresh Worker per run, terminated on timeout. `terminate()` is the only reliable way to stop a
`while (true)`; nothing cooperative can.

## Consequences

**Easy.** The API has no execution surface at all. Runs are instant — no network round trip.
Offline practice works.

**Hard.** Hidden test cases must be shipped to the browser to be run there. They are hidden from
the UI, not secret. For a personal training app that is the right trade; for a product with
leaderboards it would not be.

Timings are the user's machine, not a controlled runner. The per-case performance budget is
therefore generous (2s) and calibrated three orders of magnitude above the optimal solutions rather
than tightly.

## What would make us revisit

Sharing the app with other people in a way where someone gains from cheating. At that point the
server would have to re-verify submissions, and the honest way to do that is a sandboxed runner
service — which contradicts the one-deploy monolith rule, so it would be a rewrite of the premise,
not a patch.
