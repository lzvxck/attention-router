# PreToolUse hook (PowerShell variant) for apply_patch — blocks any patch touching a .env file.
$ErrorActionPreference = 'Stop'
try {
  $raw = [Console]::In.ReadToEnd()
  $payload = $raw | ConvertFrom-Json
  $patchText = $payload.tool_input | ConvertTo-Json -Depth 10 -Compress
} catch {
  $patchText = $null
}
if (-not $patchText) { exit 0 }

if ($patchText -match '\.env([^a-zA-Z]|$)') {
  Write-Error "BLOCKED: apply_patch targeting a .env file"
  exit 2
}

exit 0
