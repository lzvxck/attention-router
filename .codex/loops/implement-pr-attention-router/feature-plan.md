# Feature Plan — PR Attention Router

## Summary

Create the app-repo implementation of PR Attention Router from the supplied blueprint: a latest-stable Next.js App Router application that receives verified GitHub App webhooks, scores pull requests through Groq's OpenAI-compatible chat-completions API, records outcomes/calibration in Neon Postgres, posts Check Runs, and presents a public dashboard. Use `next@latest` rather than a preview/canary release (currently Next.js 16.2 stable; 16.3 is preview).

## Files to add / modify

| file | action | change |
|------|--------|--------|
| `package.json`, `tsconfig.json`, `next.config.ts`, ESLint/format configuration | add | Bootstrap a minimal TypeScript Next.js App Router project using `next@latest` stable with scripts for lint, typecheck, and tests; add only Next/React, the OpenAI-compatible client, Octokit, Neon, and a lightweight test runner. |
| `.gitignore`, `.env.example` | add | Exclude secrets/build artifacts and document every required GitHub, OpenAI, and Neon environment variable without values. |
| `app/layout.tsx`, `app/page.tsx`, `app/globals.css` | add | Build the unauthenticated, server-rendered dashboard with a PR timeline and a simple calibration-over-time view; provide an empty-state that permits deployment before webhook data arrives. |
| `app/api/github/webhook/route.ts` | add | Verify GitHub webhook signatures, process `pull_request` opened/synchronize/merged events, and return safe HTTP responses. |
| `lib/env.ts` | add | Validate required server-side environment configuration at use-time, keeping secrets out of client code. |
| `lib/types.ts` | add | Define risk tiers, structured GPT verdicts, changed-file metadata, and dashboard record types shared by server modules. |
| `lib/db.ts`, `lib/repositories.ts` | add | Provide parameterized Neon queries for repo upsert, PR verdict persistence, revert outcomes, per-pattern stats, and dashboard reads. |
| `lib/github.ts` | add | Create authenticated installation clients, fetch PR changed files/diff, and create/update a Check Run. |
| `lib/risk-scoring.ts` | add | Call Groq through its OpenAI-compatible chat-completions API with structured output; include bounded diff/file context and repo-specific calibration stats in the prompt; validate the returned verdict. |
| `lib/revert-calibration.ts` | add | Detect GitHub-native revert PR title/body syntax, resolve the original PR by commit SHA, persist the reverted outcome, and update path-pattern risk counters transactionally. |
| `db/migrations/001_initial_schema.sql` | add | Create the planned `repos`, `pull_requests`, `outcomes`, and `file_risk_stats` tables, constraints, indexes, and an idempotent migration path. |
| `tests/**/*.test.ts` plus test setup | add | Unit-test pure parsing, calibration, and scoring validation; mock OpenAI/Octokit/DB at boundaries; add route-level webhook scenarios. |
| `README.md` | add | Document local setup, migration/deployment, GitHub App permissions/webhook setup, dashboard and judge test paths, and the Codex session requirement. |
| `AGENTS.md` | modify | Refresh the durable source of truth with the actual implementation details, schema decisions, and repository URLs once they exist. |

## Contract / data / API changes

- GitHub receives one webhook endpoint: `POST /api/github/webhook`. It accepts only correctly signed `pull_request` events and handles `opened`, `synchronize`, and merged `closed` actions.
- A successful open/synchronize event persists the scored PR fields (`risk_tier`, `risk_rationale`, `risk_confidence`, `files_changed`, `scored_at`) and creates or updates one GitHub Check Run.
- A merged native revert PR identifies `Revert "<title>"` plus `This reverts commit <sha>.`, associates the original PR to an `outcomes` record, and updates file-pattern totals/revert counts.
- The database schema matches the four tables in `AGENTS.md`, using parameterized SQL and unique keys needed for idempotent webhook redelivery handling.
- Groq's OpenAI-compatible chat-completions API must return `{ tier, confidence, rationale, key_risk_factors }`; only `auto-mergeable`, `quick-glance`, and `deep-review` are valid tiers. Invalid model output fails safely without marking a PR as successfully scored.
- Dashboard reads are public and server-side; no client-visible secret, write endpoint, or authentication bypass is introduced.

## Test plan

- Unit: test webhook revert parsing (valid native convention, malformed body, non-revert); path-pattern normalization/stat calculations; structured score validation and calibration prompt construction.
- Unit: test database repository functions with mocked Neon queries, including idempotent PR/revert persistence and counter updates.
- Integration: mock a signed `pull_request.opened` webhook and assert changed files/diff are collected, a calibrated score is stored, and a Check Run is posted.
- Integration: mock a merged native revert webhook and assert the original PR receives a reverted outcome and all matching file-risk stats change.
- Integration: render the dashboard against representative records and assert tiers, rationales, outcomes, and calibration values are visible, including the empty state.
- Gates: run `npm.cmd run lint`, `npm.cmd run typecheck`, and `npm.cmd test` on native Windows PowerShell.

## Acceptance criteria

- [ ] A fresh clone can install dependencies, configure `.env` from `.env.example`, run the migration, and start the Next.js app using the README.
- [ ] A valid signed open/synchronize webhook produces one validated Groq verdict, persists it, and posts a GitHub Check Run; invalid signatures and invalid model output do not perform those writes.
- [ ] A merged GitHub-native revert PR marks the original PR as reverted and updates its affected path-pattern counters exactly once across webhook redeliveries.
- [ ] The public dashboard renders saved PR decisions beside outcomes and a calibration-over-time view without authentication.
- [ ] No secrets are committed or sent to the browser, and SQL/database access is parameterized.
- [ ] `npm.cmd run lint`, `npm.cmd run typecheck`, and `npm.cmd test` all pass.
- [ ] `AGENTS.md` reflects the actual Groq runtime and any implementation-time schema decisions.

## Rollout / rollback

- Deploy to Vercel only after environment variables and the Neon migration are configured; register the GitHub App with the documented minimum permissions and point its webhook at the deployed endpoint.
- First install on the demo repository and validate the two live PR scenarios before publishing the public install link.
- Roll back by redeploying the prior Vercel deployment and disabling/uninstalling the GitHub App; database writes are additive, so retain them for diagnosis unless a later migration explicitly requires a rollback script.

## Risks

| risk | impact | mitigation |
|------|--------|------------|
| Project has no Git repository or Next.js scaffold | Implementation cannot use required worktrees/commits until initialized | Initialize a local Git repository and scaffold before feature commits; user creates/configures the public GitHub remote. |
| Webhook retries/cold starts | Duplicate records or delayed Check Runs | Use database uniqueness/upserts and idempotent event handling; test redelivery scenarios. |
| Large PR diffs exceed model/context/time budgets | Scoring fails or is slow | Bound and summarize transmitted diff/file context, state truncation in rationale metadata, and fail visibly without a false verdict. |
| Groq structured output deviates from schema | Incorrect tier or failed workflow | Use strict structured output plus server-side validation and no Check Run success on invalid output. |
| GitHub revert text is not perfectly uniform | Missed ground-truth outcomes | Restrict automatic calibration to the documented native convention; record only confidently matched SHA references. |
| Runtime-provider decision changes | A build violates the approved provider choice | User approved Groq through its OpenAI-compatible API; keep AGENTS.md and README consistent with that decision. |
