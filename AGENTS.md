# Project: PR Attention Router

Submission for **OpenAI Build Week** (Devpost, category **Developer Tools**,
deadline **July 21, 2026, 5:00pm PT**).

## Implementation record (2026-07-16)

- Implemented locally as a latest-stable Next.js App Router app; deployment and public repository URLs are still pending.
- Runtime scoring uses Groq's free-tier-compatible OpenAI chat-completions API at `https://api.groq.com/openai/v1`, not the OpenAI API.
- `db/migrations/001_initial_schema.sql` adds the four planned tables, unique `(owner,name)` and `(repo_id,number)` keys, and primary-keyed outcomes for webhook redelivery idempotency.
- The webhook endpoint is `POST /api/github/webhook`; it verifies signatures, scores open/synchronize events, writes Check Runs, and calibrates native merged reverts.
- Code quality uses Biome (formatter and recommended linter rules) without ESLint or Prettier. Biome's recommended rules cover React exhaustive dependencies and the applicable accessibility checks for this small dashboard.
- Bun is the package manager and local script runner. Vercel production remains on Node.js: the webhook route explicitly declares `runtime = "nodejs"`; Bun is not a Vercel Functions runtime here.
- Per-user dashboard access uses Better Auth's stateless encrypted GitHub OAuth cookies. Enable GitHub App user authorization, grant **Email addresses: Read-only**, and set the callback to `/api/auth/callback/github`; the dashboard cross-references GitHub-accessible installation repositories server-side before querying data.

**Status:** planning complete, no code written yet. This file is the durable
source of truth — update it (not just `IMPLEMENTATION_PLAN.md`, which is a
local scratch doc and is not committed) as soon as real decisions or URLs
replace the planned ones below. In particular: refresh this file once the
GitHub App webhook endpoint exists — swap the planned core-loop steps for
what was actually built, add the real repo names/URLs, and note any schema
changes made during implementation.

## What we're building (one-liner)

A GitHub App that scores every PR with an LLM into a risk tier
(auto-mergeable / quick glance / deep review) with a rationale, calibrated
against that specific repo's real revert history — an attention router, not
another "read the diff and comment" review bot.

## Hard constraints (do not violate)

- The core implementation must be built predominantly **in an OpenAI Codex
  session** — a Codex session ID covering "the majority of core
  functionality" is a submission requirement. This is a build-tool
  requirement only — the shipped app does NOT need to call the OpenAI API at
  runtime.
- Two separate GitHub repos (both public, on the user's account):
  - **Demo repo** (fixture, not judged core): a real-time leaderboard/counter
    service for millions of users, seeded with ~15–20 real PRs (3–5 of them
    later reverted via GitHub's native "Revert" button convention:
    title `Revert "<original title>"`, body `This reverts commit <sha>.`).
  - **App repo** (the judged Project — this is where the webhook endpoint
    below lives): Next.js (latest stable, App Router) + TypeScript on Vercel,
    Neon Postgres, Octokit + `@octokit/webhooks` + `@octokit/auth-app` for
    GitHub, **Groq's OpenAI-compatible chat completions API** (free tier,
    chosen since runtime OpenAI API usage is not required) for
    structured/JSON-schema output.

## Core loop (app repo — build predominantly in Codex)

1. Webhook receiver verifies signature, handles `pull_request` `opened` /
   `synchronize` / `closed`(merged).
2. On open/sync: fetch diff + changed files; pull prior risk stats for
   matching file/path patterns from Postgres.
3. Call Groq (OpenAI-compatible chat completions API) with a structured prompt → `{ tier, confidence, rationale, key_risk_factors }`.
4. Post result as a GitHub Check Run (tier as conclusion, rationale in output).
5. Store the PR + verdict in Postgres.
6. On merge: detect native revert PRs, resolve the original PR via commit SHA,
   mark its outcome `reverted`, update a per-file-pattern revert-rate table
   that biases future Groq calls (simple/rule-based calibration, not ML).
7. Public, unauthenticated dashboard: PR timeline with risk tier at decision
   time vs. actual outcome, plus a calibration-over-time view.

**DB schema:**

- `repos(id, owner, name, installation_id)`
- `pull_requests(id, repo_id, number, title, author, head_sha, files_changed jsonb, risk_tier, risk_rationale, risk_confidence, scored_at)`
- `outcomes(pr_id, outcome_type, reverted_by_pr_id, detected_at)`
- `file_risk_stats(repo_id, path_pattern, total_prs, reverted_prs, updated_at)`

## Rules

Follow `.codex/rules/code-quality.md` when writing, editing, or reviewing any
code in this repo (simplicity, surgical changes, goal-driven execution).
