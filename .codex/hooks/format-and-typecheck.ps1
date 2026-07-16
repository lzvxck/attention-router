# PostToolUse hook (PowerShell variant) for apply_patch — auto-format files just changed.
# apply_patch can touch multiple files in one call, so this uses git to discover
# what changed rather than a single file-path field from the stdin payload.
try { [Console]::In.ReadToEnd() | Out-Null } catch {}

$changed = @(git diff --name-only HEAD 2>$null) + @(git diff --name-only --cached 2>$null) | Select-Object -Unique
if (-not $changed) { exit 0 }

foreach ($file in $changed) {
  if (-not (Test-Path $file)) { continue }
  $ext = [System.IO.Path]::GetExtension($file).TrimStart(".")

  switch ($ext) {
    { $_ -in "ts","tsx","js","jsx","mjs","cjs" } {
      if (Get-Command prettier -ErrorAction SilentlyContinue) {
        prettier --write $file --log-level warn
      }
      if (Get-Command tsc -ErrorAction SilentlyContinue) {
        tsc --noEmit 2>&1 | Select-Object -First 20
      }
    }
    "py" {
      if (Get-Command ruff -ErrorAction SilentlyContinue) {
        ruff format $file
        ruff check --fix $file
      } elseif (Get-Command black -ErrorAction SilentlyContinue) {
        black $file --quiet
      }
    }
    "rs" {
      if (Get-Command rustfmt -ErrorAction SilentlyContinue) { rustfmt $file }
    }
    "go" {
      if (Get-Command gofmt -ErrorAction SilentlyContinue) { gofmt -w $file }
    }
  }
}

exit 0
