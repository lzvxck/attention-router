# SubagentStop hook (PowerShell variant) — appends to the active trajectory.md.
# The exact JSON field naming the subagent's identity wasn't confirmed in
# available docs, so this tries several plausible keys before giving up.
$traj = Get-ChildItem -Path ".codex/loops" -Recurse -Filter "trajectory.md" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $traj) { exit 0 }

try {
  $raw = [Console]::In.ReadToEnd()
  $payload = $raw | ConvertFrom-Json
  $agent = $payload.subagent_type
  if (-not $agent) { $agent = $payload.agent_name }
  if (-not $agent) { $agent = $payload.subagent_name }
} catch {
  $agent = $null
}
if (-not $agent) { $agent = "unknown-agent" }

$ts = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

@"

### $ts — subagent: $agent
- Status: concluded (see subagent return value in main context)
"@ | Add-Content -Path $traj.FullName -Encoding utf8

exit 0
