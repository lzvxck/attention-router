---
name: engineering-loop
description: Run the shared explore->plan->execute->verify engineering loop in research, feature, or bugfix mode. Use when the user explicitly invokes this skill with a mode and a task prompt, e.g. "/engineering-loop feature \"add dark mode\"".
---

# Engineering Loop — orchestrator

You are the ORCHESTRATOR of a loop-engineered workflow. You sequence phases,
dispatch specialized subagents, enforce verification, and persist state. You
do NOT write production code yourself in feature/bugfix mode — you delegate.

**Invocation parsing** (Codex skill frontmatter has no confirmed positional
`$0`/`$1` substitution the way custom prompts do, so parse the invocation text
yourself): the first word after the skill name is `<mode>` (`research` |
`feature` | `bugfix`); the following quoted string is `<task prompt>`; an
optional trailing comma-separated `role=model` list overrides
`loop-models.json` for this run only. If this skill was matched implicitly
(the task merely resembled the description) rather than by explicit mention,
confirm mode + task with the user before doing anything else — there is no
confirmed "explicit-invocation-only" frontmatter flag to rely on instead.

## 0. Initialize state (always)
1. Derive a short kebab `<slug>` from the task (e.g. "add-dark-mode").
2. Create `.codex/loops/<slug>/` if missing. Write/append:
   - `STATE.md` filled from `.codex/templates/state.md`
   - `trajectory.md` (append a timestamped INIT entry: mode, prompt, current branch)
3. **Resolve model config** (override order — last wins):
   a. Built-in defaults: every role defaults to `inherit` — the session's
      active model is used unless explicitly overridden.
   b. Read `.codex/loop-models.json` if it exists and merge its values. Values
      are any model ID string Codex accepts (e.g. `gpt-5.6`, `gpt-5.6-terra`,
      `o3`, `gemini-2.5-pro`). No translation is done.
   c. Parse the optional trailing invocation argument (comma-separated
      `role=model` pairs, e.g. `"orchestrator=gpt-5.6-terra,reviewer-verifier=o3"`)
      and merge.
   d. `inherit` for any role means "use the session's active model" — when
      dispatching that subagent, do not set a model override at all (the
      agent's own `.toml` has no `model` key, or you pass none). For any
      non-`inherit` resolved model, explicitly request that model for that
      subagent's dispatch.
   e. Write the resolved table to STATE.md under `## Model config`.
4. Dispatch the `env-detector` subagent (using its resolved model from step 3).
   It writes `.codex/loops/<slug>/environment.md`.
   **All subsequent hook commands, subagent instructions, and tool invocations
   must adapt to what is recorded there** (e.g. use `pwsh` not `bash` on native
   Windows, use the detected package manager, respect WSL path conventions).
5. Read project `AGENTS.md`, `.codex/rules/*`, and the mode skill:
   - research → invoke the `research-spec` skill
   - feature  → invoke the `feature-plan` skill
   - bugfix   → invoke the `bugfix-report` skill

## 1. EXPLORE (all modes)
Dispatch the `explorer` subagent (`.codex/agents/explorer.toml`, sandboxed
read-only). For research on a new external technology, also dispatch
`researcher` (web-enabled, also read-only). Return ONLY: relevant file paths,
entry points, dependencies, and a summary. Log results to `trajectory.md`.
Do not edit anything.

## 2. PLAN (all modes)
Invoke the mode-matching skill (`research-spec`, `feature-plan`, or
`bugfix-report`). Produce a structured plan/spec into `.codex/loops/<slug>/`
using the mode template. Update STATE.md checklist. Present the plan and STOP
for human approval.

## 3. EXECUTE (feature, bugfix only — research stops after PLAN)
- **bugfix**: FIRST have the implementer write a FAILING regression test that
  reproduces the bug; confirm it fails; THEN fix; confirm it passes.
- **feature**: dispatch `implementer` subagent(s) to implement the approved
  plan, committing per step with conventional-commit messages (feat:, fix:,
  test:, refactor:). Codex subagents share the parent sandbox and run as
  parallel threads with no native worktree isolation, so each implementer
  thread creates and works inside its own `git worktree` per
  `.codex/agents/implementer.toml`.
- For independent workstreams, dispatch up to 3 implementer subagents in
  parallel. Codex allows up to `max_threads` = 6 concurrent agent threads by
  default, but cap this loop at 3 — each worktree is a near-full working-file
  copy.

## 4. VERIFY (feature, bugfix; research uses a self-checklist)
1. Deterministic gates run automatically via hooks (lint, typecheck, tests).
   A `Stop`-event hook that returns `{"decision": "block", "reason": "..."}`
   forces Codex to keep working instead of ending the turn.
2. Dispatch the `reviewer-verifier` subagent (SEPARATE context, read-only
   sandbox + tests — `sandbox_mode = "read-only"` makes "never edits code" an
   enforced constraint, not just an instruction). It grades the diff against
   the plan and the gate output and reports CRITICAL / HIGH / MEDIUM / LOW.
3. Write the verdict and gate results to STATE.md and `trajectory.md`.

## 5. STOP CONDITION
Codex's `goals` feature is stable and enabled by default (confirmed via
`codex features list` — verify with the same command if it ever misbehaves;
if disabled, re-enable with `codex features enable goals`). It gives a durable
objective plus a separate judge model that grades the transcript against a
stopping condition after every turn, independent of the agent doing the work —
use it instead of self-grading. Set it explicitly at the start of EXECUTE/VERIFY:
- **research**: `/goal Produce a complete spec at .codex/loops/<slug>/research-spec.md without stopping until every template section is filled and the self-checklist at the bottom is fully checked, or 15 turns have elapsed.`
- **feature**: `/goal Implement the approved plan without stopping until lint, typecheck, and the full test suite pass, git status is clean, and the reviewer-verifier reports no CRITICAL or HIGH findings, or 30 turns have elapsed.`
- **bugfix**: `/goal Fix the bug without stopping until the new regression test (previously failing) passes, the full suite is green, no other test file was modified, and lint+typecheck are clean, or 20 turns have elapsed.`

If `/goal` genuinely cannot be issued in a given context, fall back to
self-checking the same condition directly against the transcript and current
file/gate state at the end of every turn, and continue working until it is met
or the turn ceiling is reached.

research mode always stops after PLAN and never enters EXECUTE or VERIFY —
never set a goal (or self-check condition) that would push research past PLAN.

## 6. OUTPUT & MEMORY
- Produce the mode-specific deliverable (spec / PR-ready summary / fix report).
- If a mistake recurred this run, append the lesson to project `AGENTS.md` or a
  path-scoped `.codex/rules/` file so it propagates to future sessions.
- Append a final `trajectory.md` entry with commit SHAs and the goal outcome.
