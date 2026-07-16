---
name: verify-gate
description: Run the deterministic verification gate (lint, typecheck, tests) and summarize pass/fail. Use after implementation and before declaring done.
---

# Verify gate

## Context
Changed files: run `git status --short` yourself before starting.
Shell to use: read `.codex/loops/<slug>/environment.md` → "Codex invoking via" field.

## Steps
1. Read `environment.md` to find the correct shell and the detected package manager.
2. Run lint, typecheck, and the full test suite using the commands from
   `AGENTS.md` (or the detected stack if `AGENTS.md` has none).
3. Report a compact table:

   | gate       | command          | exit code | failures |
   |------------|------------------|-----------|----------|
   | lint       | …                | 0 / 1     | n        |
   | typecheck  | …                | 0 / 1     | n        |
   | tests      | …                | 0 / 1     | n        |

4. If anything failed, list the first failing item per gate with `file:line` and
   a one-line cause.
5. Do NOT fix anything — only report. The orchestrator decides next steps.
