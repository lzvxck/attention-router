---
name: feature-plan
description: Turn exploration into a structured, reviewable implementation plan with file-level changes, test strategy, and acceptance criteria. Used by the engineering loop in feature mode.
---

# Feature plan

Produce an implementation plan for the task prompt handed to you by the
orchestrator (the text following this skill's invocation).

Using `.codex/templates/feature-plan.md`, specify:
- Summary (1–3 sentences)
- Files to add or modify (with the specific change in each)
- Data / contract / API changes
- Test plan (unit + integration)
- Acceptance criteria phrased as verifiable checks
- Rollout / rollback strategy
- Risks

Keep it concrete enough that an implementer subagent can execute it without
re-deciding architecture. Write the result to `.codex/loops/<slug>/feature-plan.md`
and update `STATE.md`. Do NOT write production code — planning only.
