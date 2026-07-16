---
name: thermos
description: Launch both thermo-nuclear review subagents in parallel, then synthesize their findings. Use for thermos, double thermo review, or combined bug/security and code-quality branch audits.
---

<!-- Ported from Cursor's "Thermos" plugin (cursor/plugins, MIT license):
     https://github.com/cursor/plugins/tree/main/thermos
     Orchestration mechanics translated from Cursor's Task/subagent_type/
     run_in_background dispatch to Codex's native subagent spawning. -->

# Thermos

Run the two thermo review passes as parallel Codex subagents, then synthesize
their results.

If this skill was matched implicitly rather than explicitly mentioned,
confirm with the user before running both passes — they are deliberately
harsh and produce a lot of output for a task that only loosely resembled this
description.

## Workflow
1. Determine the review scope from the user request, PR, current branch, or
   relevant changed files.
2. Gather the diff (`git diff <base>...HEAD`, default base `main`) and full
   contents of the changed files yourself, using your own shell access —
   enough context that reviewers can evaluate the change without guessing.
   (Cursor's version spawns separate `shell`/`explore` subagents for this
   step; Codex's main agent already has direct Bash access, so there is no
   need for extra subagents just to gather context.)
3. Spawn both review subagents in the same turn so Codex runs them as
   parallel threads — this is the default behavior when more than one agent
   is spawned in one message (up to `max_threads`, default 6), so no
   equivalent of Cursor's `run_in_background: true` flag is needed:
   - `thermo-nuclear-review-subagent` for bugs, breakages, security, devex
     regressions, feature-flag leaks, and other branch-audit risks.
   - `thermo-nuclear-code-quality-review-subagent` for maintainability,
     structure, file-size growth, spaghetti, abstractions, and
     codebase-health risks.
4. Pass each subagent the same scoped diff/file context (labeled "### Git /
   diff output" and "### Changed file contents") and ask it to return
   prioritized findings with file references and evidence.
5. After both finish, synthesize the results with findings first, deduplicated
   across reviewers. Weight overlapping findings more heavily, resolve
   disagreements with your own judgment, and keep summaries brief.

If individual subagent summaries are already visible to the user, do not
restate them wholesale. Surface the unified verdict, the highest-signal
findings, and any remaining uncertainty.
