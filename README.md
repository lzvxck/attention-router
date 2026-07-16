# PR Attention Router

A GitHub App that scores every pull request into a risk tier —
**auto-mergeable**, **quick-glance**, or **deep-review** — with a rationale,
calibrated against that specific repository's real revert history. It's not
another "read the diff and comment" review bot: it's an attention router that
learns, per repo, where your review time actually matters.

**Live dashboard:** https://attention-router.vercel.app/

## Try it right now (no setup)

Just open the dashboard link above. You'll see the curated demo repo
(`real-time-leaderboard`, a simulated sharded counter service) with its full
PR history: every risk tier the model assigned at the time, next to what
actually happened later — including the PRs it flagged correctly, and the one
it initially waved through as "auto-mergeable" that later got reverted.

## Use it on your own repo

1. **Install the GitHub App** → https://github.com/apps/attn-router
   Choose "Only select repositories" and pick whichever repo you want to try
   it on (a throwaway test repo is fine).
2. **Open a pull request** on that repo (or push a new commit to one that's
   already open).
3. Within moments, check that PR's **"Checks" tab** on GitHub — "PR Attention
   Router" posts the risk tier and rationale directly there, no dashboard
   visit required.
4. **Sign in with GitHub** on the [dashboard](https://attention-router.vercel.app/)
   to see that same PR (and any others in repos you've installed the App on)
   in our timeline + calibration view, scoped only to what you have access to.
5. **To see calibration learn from a mistake:** merge a PR, then click
   GitHub's native **"Revert"** button on it and merge the resulting revert
   PR too. The dashboard marks the original PR's outcome as "reverted" and
   adjusts future scoring for that file pattern in that repo.

## What it actually does

- On every `opened`/`synchronize` PR event: fetches the changed files, pulls
  this repo's historical revert rate for matching file-path patterns, and
  asks an LLM (Groq) for a structured verdict — tier, confidence, rationale,
  key risk factors.
- Posts the verdict as a GitHub Check Run.
- On merge: records the real merge commit SHA. If the merge is a native
  GitHub revert (title `Revert "…"`, body `This reverts commit <sha>.`), the
  original PR is marked reverted and the file-pattern calibration stats
  update — so a similar change next time is judged with that history in mind.
- The dashboard (`/`) shows a public, unauthenticated view of one curated
  demo repository. Signed-in users (`/app`) see only the repos GitHub
  confirms they have access to, via `GET /user/installations` — nobody types
  in an App ID or installation ID by hand.

## GitHub App permissions

Pull requests: Read & Write · Checks: Read & Write · Contents: Read-only ·
Metadata: Read-only. Subscribed event: Pull request.

## Local setup (only needed to develop this repo, not to use the dashboard)

```
bun install
cp .env.example .env.local   # fill in the values below
bun run scripts/run-migration.ts   # applies db/migrations/001_initial_schema.sql
bun run dev
```

Env vars needed in `.env.local`: `GITHUB_APP_ID`, `GITHUB_PRIVATE_KEY`,
`GITHUB_WEBHOOK_SECRET`, `GROQ_API_KEY`, `GROQ_MODEL` (must support strict
JSON-schema structured outputs — use `openai/gpt-oss-120b` or
`openai/gpt-oss-20b`; general-purpose Llama models on Groq return a 400 here),
`DATABASE_URL` (Neon), `BETTER_AUTH_URL`, `SESSION_SECRET` (32+ random bytes),
`GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, `DEMO_REPO_OWNER`,
`DEMO_REPO_NAME`. Point the GitHub App's webhook at
`https://<your-tunnel-or-domain>/api/github/webhook` to receive events while
developing locally.

Verify: `bun run lint`, `bun run typecheck`, `bun run test`.

## Built with Codex

The idea didn't start as a single pitch — it came out of researching several
different hackathon concepts in parallel and comparing them against what
already exists (CodeRabbit, Greptile, and other "read the diff and comment"
review bots). Codex helped weigh those options and converge on the actual
differentiator here: routing reviewer *attention* based on a repo's real
revert history, instead of shipping another generic critic bot.

Development itself ran as a structured loop rather than free-form prompting:
a set of custom subagents and skills (explorer, implementer, reviewer-verifier,
and a "thermo-nuclear" code-quality/security review pair, all under `.codex/`)
built specifically for this project, orchestrated through an
explore → plan → execute → verify cycle. The proposed architecture and task
breakdown (webhook flow, DB schema, auth, calibration logic) were handed to
Codex as a concrete plan, and Codex carried out the actual development and
implementation work inside that loop — including catching and fixing its own
regressions along the way (e.g. the merge-commit-SHA revert-matching bug, and
the Groq structured-output model incompatibility).

Codex session ID: `019f6c3a-e4e6-7e93-8227-58196adc2b0d`
