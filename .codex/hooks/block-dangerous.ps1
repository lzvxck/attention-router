# PreToolUse hook (PowerShell variant) for Bash — blocks destructive commands and .env access.
# Codex passes a JSON payload on stdin; there is no CLAUDE_TOOL_INPUT_COMMAND-style env var.
$ErrorActionPreference = 'Stop'
try {
  $raw = [Console]::In.ReadToEnd()
  $payload = $raw | ConvertFrom-Json
  $cmd = $payload.tool_input.command
} catch {
  $cmd = $null
}
if (-not $cmd) { exit 0 }

$blocked = @(
  "rm -rf /",
  "rm -rf ~",
  "Remove-Item -Recurse -Force C:\\",
  "git push --force.*main",
  "git push --force.*master",
  "git push -f.*main",
  "git push -f.*master",
  "git reset --hard",
  "Format-Volume",
  "Clear-Disk"
)

foreach ($pattern in $blocked) {
  if ($cmd -match $pattern) {
    Write-Error "BLOCKED: dangerous command pattern detected: $pattern"
    exit 2
  }
}

if ($cmd -match '\.env[^a-zA-Z]|\.env$') {
  Write-Error "BLOCKED: .env file access via Bash"
  exit 2
}

exit 0
