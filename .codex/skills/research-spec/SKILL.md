---
name: research-spec
description: Explore a topic, library, or codebase; compare alternatives and tradeoffs; produce a structured markdown research spec / build contract. Used by the engineering loop in research mode.
---

# Research spec

Research the task prompt handed to you by the orchestrator (the text following
this skill's invocation) thoroughly and produce a build-contract spec.

1. If the task concerns an **existing codebase**: map directory structure (top
   3 levels), entry points, dependency graph, and the design patterns in use.
   Prefer language-aware navigation over raw grep when available.
2. If the task concerns a **new technology**: gather authoritative sources via
   Codex's native `web_search` tool (only available if this session was
   started with `--search` — if it isn't, say so rather than fabricating
   sources), and compare at least two alternatives with explicit tradeoffs
   (performance, maturity, ecosystem, lock-in).
3. Fill out `.codex/templates/research-spec.md` and write the result to
   `.codex/loops/<slug>/research-spec.md`: problem, constraints, options
   considered, recommendation + rationale, proposed architecture, file-level
   change plan, test strategy, acceptance criteria, risks, open questions,
   sources.
4. End with the self-checklist — every item must be checkable from the
   transcript so the stop condition (goal mode or self-check, see the
   `engineering-loop` skill) can verify completion without running tools.

Return the path to the written spec and a 5-bullet summary.
