# PR Attention Router

GitHub App that routes pull requests to the right level of reviewer attention, then calibrates those decisions against native GitHub reverts.

## Local setup

1. Copy `.env.example` to `.env.local` and provide the GitHub App credentials, `GROQ_API_KEY`, and Neon `DATABASE_URL`.
2. Run `npm.cmd install`, then apply `db/migrations/001_initial_schema.sql` to Neon.
3. Run `npm.cmd run dev`; configure the GitHub App webhook as `https://your-domain/api/github/webhook`.

The GitHub App requires Pull requests (read), Checks (write), and Contents (read). Groq is used through its OpenAI-compatible endpoint at `https://api.groq.com/openai/v1`; the default free-tier-friendly model is `llama-3.3-70b-versatile`.

The public dashboard is `/`. Verify locally with `npm.cmd run lint`, `npm.cmd run typecheck`, and `npm.cmd test`.

This core functionality was developed in an OpenAI Codex session, as required by the Build Week submission.
