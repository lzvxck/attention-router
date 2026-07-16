# Environment — implement-pr-attention-router
Detected: 2026-07-16T00:00:00-03:00

## OS & kernel
- Platform: Windows
- Version: Microsoft Windows NT 10.0.26200.0
- WSL distro: N/A (the host is native Windows; WSL is installed with default version 2)

## Shell
- Default shell: pwsh
- Shell version: PowerShell 5.1.26100.8875 (Desktop edition)
- Codex invoking via: pwsh  ← orchestrator reads this for hook commands

## Package managers (found only)
| tool | version |
|------|---------|
| npm | 11.13.0 |
| bun | 1.3.14 |

## Language runtimes (found only)
| runtime | version |
|---------|---------|
| Node.js | v24.16.0 |

## Key tools
| tool   | version | present |
|--------|---------|---------|
| git    | git version 2.54.0.windows.1 | yes |
| docker | Docker version 29.6.1, build 8900f1d | yes |
| curl   | curl 8.19.0 | yes |
| jq     | N/A | no |
| make   | N/A | no |
| podman | N/A | no |

## Path conventions
- Style: Windows `C:\Users\`
- Home: `C:\Users\lioar`
- Project root: `C:\Users\lioar\Desktop\Tools\SWE\Projects\openai-hackaton`
- Line endings: LF

## Hook compatibility
- Shell invocation for hooks: `pwsh -NonInteractive -File .codex/hooks/foo.ps1`
- Notes: Native Windows PowerShell is the active shell. Git Bash is available at `C:\Program Files\Git\usr\bin\bash.exe`, but hooks should use PowerShell. Invoke npm through `npm.cmd` because the PowerShell execution policy blocks `npm.ps1`.
