---
paths: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.py", "**/*.go", "**/*.rs", "**/*.java", ".codex/agents/implementer.toml", ".codex/agents/reviewer-verifier.toml"]
---

# Code-quality rules

These apply whenever writing, editing, or reviewing code.

## Think before coding
- State assumptions explicitly before implementing. If uncertain, ask — don't guess silently.
- If multiple interpretations exist, present them; do not pick one without surfacing the choice.
- If a simpler approach exists, say so and push back.

## Simplicity first
- Write the minimum code that solves the problem. No speculative features, abstractions, or
  configurability that wasn't asked for.
- No error handling for scenarios that cannot happen.
- If the result is 200 lines and could be 50, rewrite it.
- Gut check: "Would a senior engineer call this overcomplicated?" If yes, simplify.

## Surgical changes
- Touch only what the task requires. Do not improve adjacent code, comments, or formatting.
- Match existing style, even if you would do it differently.
- If you notice unrelated dead code, mention it — do not delete it.
- Remove only the imports / variables / functions that YOUR changes made unused.
- Every changed line should trace directly to the user's request.

## Goal-driven execution
Transform every task into a verifiable goal before touching code:
- "Add validation"  → write tests for invalid inputs, then make them pass.
- "Fix the bug"     → write a test that reproduces it, then make it pass.
- "Refactor X"      → confirm tests pass before and after.

For multi-step tasks, state the plan first:
```
1. [step] → verify: [check]
2. [step] → verify: [check]
```
Weak success criteria ("make it work") require constant clarification and let bugs hide.
