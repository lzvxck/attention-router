#!/usr/bin/env bash
# PreToolUse hook for Bash — blocks destructive commands and .env access.
# Codex passes a JSON payload on stdin (fields: tool_name, tool_input, ...) —
# there is no CLAUDE_TOOL_INPUT_COMMAND-style env var, unlike some other runners.
set -uo pipefail

INPUT="$(cat)"
CMD="$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)"

BLOCKED=(
  "rm -rf /"
  "rm -rf ~"
  "rm -rf \*"
  "git push --force.*main"
  "git push --force.*master"
  "git push -f.*main"
  "git push -f.*master"
  "git reset --hard"
  "chmod -R 777"
  "dd if="
  "mkfs"
  ":(){ :|:& };:"
)

for pattern in "${BLOCKED[@]}"; do
  if echo "$CMD" | grep -qE "$pattern"; then
    echo "BLOCKED: dangerous command pattern detected: $pattern" >&2
    exit 2
  fi
done

# Codex has no separate "Read" tool (unlike some other runners) — all reads go
# through Bash, so .env access is intercepted here rather than in a second hook.
if echo "$CMD" | grep -qE '\.env[^a-zA-Z]|\.env$'; then
  echo "BLOCKED: .env file access via Bash" >&2
  exit 2
fi

exit 0
