# PR Attention Router

## GitHub OAuth dashboard setup

Enable **Request user authorization (OAuth) during installation** for the GitHub App, grant **Email addresses: Read-only**, and set the callback URL to `https://<your-domain>/api/auth/callback/github`. Set `BETTER_AUTH_URL`, `SESSION_SECRET` (32+ random bytes), `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, `DEMO_REPO_OWNER`, and `DEMO_REPO_NAME` before deploying. Anonymous visitors see only the configured demo repository; signed-in users can view only repositories returned by GitHub for their installations.

GitHub App that routes pull requests to the right level of reviewer attention, then calibrates those decisions against native GitHub reverts.

## Local setup

1. Copy `.env.example` to `.env.local` and provide the GitHub App credentials, `GROQ_API_KEY`, and Neon `DATABASE_URL`.
2. Run `npm.cmd install`, then apply `db/migrations/001_initial_schema.sql` to Neon.
3. Run `npm.cmd run dev`; configure the GitHub App webhook as `https://your-domain/api/github/webhook`.

The GitHub App requires Pull requests (read), Checks (write), and Contents (read). Groq is used through its OpenAI-compatible endpoint at `https://api.groq.com/openai/v1`; the default free-tier-friendly model is `llama-3.3-70b-versatile`.

The public dashboard is `/`. Verify locally with `npm.cmd run lint`, `npm.cmd run typecheck`, and `npm.cmd test`.

This core functionality was developed in an OpenAI Codex session, as required by the Build Week submission.
