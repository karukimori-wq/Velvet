# Velvet Persistence & Auth Setup

## Current state
Velvet can run in development with in-memory repositories and the demo owner. This mode is intentionally not production-ready.

The PostgreSQL connection layer and storage-aware repositories are implemented for the current mutable MVP domains:
- People
- Knowledge / personality memory
- Timeline
- Visit / VisitParticipant
- Gift
- Capture
- Schedule
- Relationship
- JSON Import / Export of People data

Repositories switch between memory and PostgreSQL using `VELVET_STORAGE_MODE`.

## Production requirements
1. Implement a real per-request authentication/session adapter. Fixed-owner mode is not acceptable for a public multi-account deployment.
2. Set `VELVET_STORAGE_MODE=postgres`.
3. Set `DATABASE_URL` to the production PostgreSQL connection string.
4. Apply migrations in order:
   - `db/001_initial.sql`
   - `db/002_runtime_fields.sql`
5. Verify `GET /api/storage/check` returns `status: success`.
6. Verify `GET /api/readiness` reports database connection success.
7. Verify every private query includes `owner_user_id`.
8. Run typecheck/build in the deployment CI environment before public launch.

## Database connection settings
- `DATABASE_URL`: PostgreSQL connection string.
- `VELVET_DB_POOL_MAX`: optional pool maximum, default `5`.
- `VELVET_DB_SSL=disable`: use only when the database explicitly does not require TLS. Otherwise TLS is enabled.

The connection pool is created lazily on the server. Database credentials must never be exposed through `NEXT_PUBLIC_*` variables.

## Auth rule
`user_demo_owner` is development-only. `VELVET_OWNER_USER_ID` is a fixed-owner testing seam only. It is useful for private single-user testing but unsafe for a public multi-account service because every request would resolve to the same owner.

Public production readiness requires a real authenticated session that resolves `ownerUserId` per request. Client form fields/query parameters must never be trusted as owner identity.

## Repository rule
UI, Server Actions and Route Handlers pass `ownerUserId` into repository methods. Repositories also filter by owner. This creates two boundaries: caller context and data query scope.

## Data model
PostgreSQL tables are defined in `db/001_initial.sql`. Runtime columns added after the initial schema are in `db/002_runtime_fields.sql`.

## Migration behavior
The demo seed data does not need to be migrated to production unless explicitly desired. JSON Import/Export is the preferred user-facing migration mechanism for existing customer lists.

## Verification endpoints
- `/api/storage/status`: configured storage mode.
- `/api/storage/check`: live PostgreSQL connectivity.
- `/api/readiness`: launch readiness; fixed-owner/demo authentication deliberately does not pass public production readiness.

## Release blockers
Do not treat Velvet as public-production-ready when any of the following is true:
- no real per-request session authentication
- PostgreSQL is not configured
- PostgreSQL cannot be reached
- migrations are not applied
- owner-scoped access can be bypassed
- typecheck/build has not passed in CI/deployment environment
