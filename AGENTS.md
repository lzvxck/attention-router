# PR Attention Router

OpenAI Build Week Developer Tools submission. It routes reviewer attention:
each GitHub PR is scored as `auto-mergeable`, `quick-glance`, or `deep-review`
with an explanation calibrated against that repository's native revert history.

## Delivery status

- The app is implemented locally; deployment, public repository URLs, GitHub App
  registration, and demo-repo seeding remain manual follow-up work.
- The core was built in Codex. Preserve the session evidence needed for submission.
- This is the judged app repo. The separate demo repo is a real-time leaderboard /
  counter fixture with 15–20 PRs and 3–5 native GitHub revert PRs.

## Stack and tooling

- Next.js 16 App Router + TypeScript, deployed to Vercel. Webhook routes use
  Node.js (`runtime = "nodejs"`); Bun is never a Vercel Functions runtime here.
- Bun is the package manager and local script runner: use `bun run <script>` and
  `bun install --frozen-lockfile`, never npm/pnpm for this project.
- Biome is the formatter and recommended linter. Run `bun run format`,
  `bun run lint`, `bun run typecheck`, `bun run test`, and `bun run build`.
- Neon Postgres uses parameterized SQL through `@neondatabase/serverless`; no ORM.
- GitHub integration uses Octokit, `@octokit/webhooks`, and `@octokit/auth-app`.
- Risk scoring uses Groq's OpenAI-compatible API at `https://api.groq.com/openai/v1`.

## Core webhook and data flow

1. `POST /api/github/webhook` verifies GitHub signatures.
2. `opened` / `synchronize` fetch changed files, retrieves path risk stats, asks
   Groq for strict JSON output, persists the verdict, and posts a Check Run.
3. `closed` + merged stores `merge_commit_sha` as the original PR's `head_sha`.
4. Native reverts (`Revert "…"` + `This reverts commit <sha>.`) mark the original
   PR as reverted and atomically update path-pattern calibration statistics.
5. Persistence is idempotent for webhook redelivery; do not split its atomic CTEs.

## Database

`db/migrations/001_initial_schema.sql` owns these tables:

- `repos(id, owner, name, installation_id)` — unique `(owner, name)`.
- `pull_requests(..., repo_id, number, head_sha, files_changed, verdict fields)` —
  unique `(repo_id, number)`.
- `outcomes(pr_id, outcome_type, reverted_by_pr_id, detected_at)`.
- `file_risk_stats(repo_id, path_pattern, total_prs, reverted_prs, updated_at)`.

## Dashboard and auth

- `/` is public and displays only `DEMO_REPO_OWNER` / `DEMO_REPO_NAME`; never show
  unscoped PR data from other installations.
- Better Auth provides stateless encrypted GitHub OAuth session/account cookies;
  no additional auth tables are used.
- `/api/auth/[...all]` owns Better Auth's OAuth callbacks; client controls call its
  typed client, never handle provider tokens directly.
- `/app` resolves GitHub installations/repos accessible to the signed-in user and
  intersects them with local `repos` records. `/app/[repoId]` repeats the server-side
  membership check before querying; a URL parameter alone is never authorization.
- GitHub App setup: enable user authorization, grant **Email addresses: Read-only**,
  and set callback URL to `/api/auth/callback/github`.
- Required auth/demo env: `BETTER_AUTH_URL`, `SESSION_SECRET` (32+ random bytes),
  `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, `DEMO_REPO_OWNER`, and
  `DEMO_REPO_NAME`. Keep every secret server-only and out of logs/client bundles.

## UI

- Follow `DESIGN.md`: Discord-inspired dark surfaces, blurple primary actions,
  GGSans/Inter stack, 8px spacing, text labels beside risk colors, 44px controls,
  visible focus treatment, and reduced-motion support.
- The public sign-in control belongs in the top navigation, not the hero.

## Engineering rules

- Follow `.codex/rules/code-quality.md`: state assumptions, make surgical changes,
  and verify each goal. Preserve unrelated work in a dirty worktree.
- Use `apply_patch` for file edits. Do not read, write, or commit secrets.
- `IMPLEMENTATION_PLAN.md` and `.agents/` are intentionally ignored and absent from
  Git history. Commits must be unsigned unless the user explicitly changes this.
