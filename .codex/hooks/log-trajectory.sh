#!/usr/bin/env bash
# SubagentStop hook — appends a timestamped entry to the active trajectory.md.
# The exact JSON field naming the subagent's identity wasn't confirmed in
# available docs, so this tries several plausible keys before giving up.
set -uo pipefail

TRAJ=$(find .codex/loops -name "trajectory.md" 2>/dev/null | head -1)
[ -z "$TRAJ" ] && exit 0

INPUT="$(cat)"
AGENT="$(echo "$INPUT" | jq -r '.subagent_type // .agent_name // .subagent_name // "unknown-agent"' 2>/dev/null)"
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || echo "unknown-time")

cat >> "$TRAJ" <<EOF

### $TS — subagent: $AGENT
- Status: concluded (see subagent return value in main context)
EOF

exit 0
