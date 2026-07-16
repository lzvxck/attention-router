# Hook authoring rules

## verify-gate scope
verify-gate only fires when `.codex/loops/*/STATE.md` exists AND `Status` is `EXECUTE` or `VERIFY`
AND `Mode` is not `research`. It must exit 0 silently for all other sessions and phases.

## Iteration ceiling
verify-gate must not `exit 2` forever. After 5 consecutive failures it writes `Status: BLOCKED`
to STATE.md and exits 0. The counter is stored in `.codex/loops/<slug>/.gate-fail-count`.

## block-dangerous.sh is a seatbelt, not a security boundary
It only intercepts the `Bash` tool via `PreToolUse`. The file-edit tool (`apply_patch`) bypasses
it entirely. Label it accordingly; do not rely on it to prevent `.env` leaks from `apply_patch`.

## .env protection has no separate "Read tool" hook to bind to
Codex has no discrete Read tool — every read goes through `Bash`, so shell-based `.env` access is
already covered by `block-dangerous.sh`'s own `.env` check. The remaining gap is `apply_patch`
(an edit could still target a `.env` file), which is closed by `block-env-patch.sh` /
`block-env-patch.ps1`, wired as a separate `matcher: "apply_patch"` `PreToolUse` hook in
`hooks.json`. If you add new sensitive file patterns, update BOTH `block-dangerous.sh` AND
`block-env-patch.sh`.

## Hooks receive JSON on stdin, not environment variables
Unlike some other runners, Codex hook commands are invoked with a JSON payload on **stdin**
(fields like `tool_name`, `tool_input`, `tool_response`, `cwd`, `session_id`) — there is no
`$CODEX_TOOL_INPUT_COMMAND`-style env var. Every hook script must read and parse stdin (e.g. via
`jq`) rather than reading env vars. Blocking uses exit code 2 (with a reason on stderr), or a JSON
response on stdout matching the event's expected shape (e.g. `hookSpecificOutput.permissionDecision:
"deny"` for `PreToolUse`, `decision: "block"` for `PostToolUse`/`Stop`/`SubagentStop`).

## Matcher values are tool names, and file edits use `apply_patch`
Codex has a single unified file-editing tool called `apply_patch` — there is no separate
`Write`/`Edit` tool pair. Any hook that should fire on file writes/edits must match `apply_patch`,
not `Write|Edit`.

## Windows dispatch uses `commandWindows`, not a shell fallback chain
Each hook entry may set both `command` (POSIX) and `commandWindows` (native Windows) directly —
there is no need for the `bash foo.sh 2>&1 || pwsh -File foo.ps1` chained-fallback trick. Keep both
script variants (`.sh` + `.ps1`) but wire them through the two dedicated fields.

## trajectory.md is an audit log
trajectory.md records what happened — it is not a replay artifact.
You cannot deterministically re-execute from it. Do not label it "replayable".
