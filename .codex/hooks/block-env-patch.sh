#!/usr/bin/env bash
# PreToolUse hook for apply_patch — blocks any patch that touches a .env file.
# Codex's only two built-in tool surfaces are Bash and apply_patch (no separate
# Read/Write/Edit tools), so this is the apply_patch-side counterpart to
# block-dangerous.sh's .env guard on the Bash side.
set -uo pipefail

INPUT="$(cat)"
# The exact sub-field holding the patch body isn't confirmed in available docs,
# so serialize the whole tool_input object as text rather than guessing a key —
# this still fires correctly even if the field name differs from expected.
PATCH_TEXT="$(echo "$INPUT" | jq -c '.tool_input // empty' 2>/dev/null)"

if echo "$PATCH_TEXT" | grep -qE '\.env([^a-zA-Z]|$)'; then
  echo "BLOCKED: apply_patch targeting a .env file" >&2
  exit 2
fi

exit 0
