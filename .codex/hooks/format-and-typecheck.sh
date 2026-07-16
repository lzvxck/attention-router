#!/usr/bin/env bash
# PostToolUse hook for apply_patch — auto-format and typecheck files just changed.
# apply_patch can touch multiple files in one call (unlike a single-file Write/Edit
# tool), so this uses git to discover what changed rather than a single file-path
# field from the stdin payload.
set -uo pipefail

cat >/dev/null  # drain stdin payload — not needed once we consult git directly

CHANGED_FILES=$( { git diff --name-only HEAD 2>/dev/null; git diff --name-only --cached 2>/dev/null; } | sort -u)
[ -z "$CHANGED_FILES" ] && exit 0

TS_FILES=""
PY_FILES=""
RS_FILES=""
GO_FILES=""

while IFS= read -r FILE; do
  [ -z "$FILE" ] && continue
  [ -f "$FILE" ] || continue
  ext="${FILE##*.}"
  case "$ext" in
    ts|tsx|js|jsx|mjs|cjs) TS_FILES="$TS_FILES $FILE" ;;
    py) PY_FILES="$PY_FILES $FILE" ;;
    rs) RS_FILES="$RS_FILES $FILE" ;;
    go) GO_FILES="$GO_FILES $FILE" ;;
  esac
done <<< "$CHANGED_FILES"

if [ -n "$TS_FILES" ]; then
  if command -v prettier &>/dev/null; then
    prettier --write $TS_FILES --log-level warn
  elif command -v eslint &>/dev/null; then
    eslint --fix $TS_FILES 2>/dev/null || true
  fi
  if command -v tsc &>/dev/null; then
    tsc --noEmit 2>&1 | head -20 || true
  fi
fi

if [ -n "$PY_FILES" ]; then
  if command -v ruff &>/dev/null; then
    ruff format $PY_FILES
    ruff check --fix $PY_FILES 2>/dev/null || true
  elif command -v black &>/dev/null; then
    black $PY_FILES --quiet
  fi
fi

if [ -n "$RS_FILES" ]; then
  command -v rustfmt &>/dev/null && rustfmt $RS_FILES
fi

if [ -n "$GO_FILES" ]; then
  command -v gofmt &>/dev/null && gofmt -w $GO_FILES
fi

exit 0
