# Velvet Persistence & Auth Setup v1.0

## Production runtime
Current production target is Cloudflare Workers/OpenNext with:
- `VELVET_STORAGE_MODE=d1`
- D1 binding `DB`, database name `velvet`
- R2 binding `MEDIA`, bucket `velvetmedia`
- `VELVET_AUTH_MODE=clerk`
- AI Platform Core service binding/URL as configured

PostgreSQL and in-memory modes remain development/compatibility paths; they are not the current Cloudflare production source of truth.

## D1 deployment
`wrangler.jsonc` intentionally keeps a placeholder database UUID in source. `.github/workflows/cloudflare-production.yml` lists/creates the Cloudflare D1 database named `velvet`, resolves its real ID, replaces the placeholder in the workflow workspace, migrates older `due_at` schema when needed, then applies `cloudflare/schema.sql` before deployment.

Do not commit a private/account-specific D1 database UUID merely to make local source look production-ready.

## R2
Pro images use R2 binding `MEDIA`. The production bucket is `velvetmedia`. Upload/retrieval/deletion are owner/customer authorized. Free upload is rejected by server-side plan enforcement.

## Authentication
Public production uses Clerk. `getRequestIdentity()` resolves the authenticated Clerk user to `userId`, `ownerUserId`, and `workspaceId`. A server-secret trusted session bridge remains available for production E2E/service checks. Demo/fixed-owner modes are forbidden for normal public production.

Never trust identity from ordinary form/query fields or untrusted headers.

## Production workflow verification
The Cloudflare Production workflow verifies:
- required Cloudflare/Clerk/session-bridge configuration
- D1 existence and schema application
- OpenNext build/deploy
- health/version/contracts/persistence status
- D1 roundtrip and owner isolation
- professional memory/visit/next-action flow
- R2 media lifecycle

A successful CI run on `main` is not the same as a Production workflow run. Only the latter proves the deployed Cloudflare revision.

## Local/development modes
In-memory/demo mode is acceptable only for local/preview work. PostgreSQL support may be used where explicitly configured, but new production work should verify D1 behavior first.

## Release blockers
- Clerk public authentication not working for ordinary browser sessions
- D1 unreachable or schema migration failure
- owner/workspace isolation bypass
- R2 authorization/plan bypass
- typecheck/build/policy guard failure
- current main not production-verified when a release decision requires deployment evidence
