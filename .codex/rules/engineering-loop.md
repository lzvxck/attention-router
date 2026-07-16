# Engineering-loop authoring rules

## Argument substitution
Always use positional `$0`/`$1`/`$2` in skill bodies — never named vars like `$mode` or `$prompt`.
Named `arguments:` frontmatter is for autocomplete hint only; named interpolation is undocumented and unreliable.

## Human gate
The PLAN phase always stops for human approval — no "trivially one-liner" exception.
Self-judged skip conditions are where scope creep enters unattended runs.

## Model config key for the reviewer
The key in `loop-models.json` is `reviewer-verifier` (matches the agent filename).
Never use `reviewer` — it does not bind to any agent and the override is silently dropped.

## Loop state location
All run state lives under `.codex/loops/<slug>/` — never `.engineering-loop/` or any project-root directory.

## research mode
research mode stops after PLAN and never enters EXECUTE or VERIFY.
The Stop hook guards on this; the SKILL must not tell the orchestrator to proceed past PLAN in research mode.

## research-spec skill
Do not add an `agent:` override to research-spec SKILL.md.
Correct `allowed-tools` (including WebSearch/WebFetch) is sufficient — routing it through a named custom agent mis-routes web research.
