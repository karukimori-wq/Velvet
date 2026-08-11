# Velvet Persistence & Auth Setup

## Current state
Velvet can run in development with in-memory repositories and the demo owner. This mode is intentionally not production-ready.

The PostgreSQL connection layer is implemented. People, Knowledge, Timeline and Visit flows now use storage-aware repositories and switch automatically between memory and PostgreSQL using `VELVET_STORAGE_MODE`.

Gift, Capture, Schedule and Relationship repository migration should be completed before public production use so no user-created domain remains volatile.

## Production requirements
1. Configure a real authentication provider and make the authenticated account resolve to an owner user ID.
2. Set `VELVET_STORAGE_MODE=postgres`.
3. Set `DATABASE_URL` to the production PostgreSQL connection string.
4. Apply `db/001_initial.sql` once to the target database.
5. Verify `GET /api/storage/check` returns `status: success`.
6. Verify every private query includes `owner_user_id`.
7. Complete PostgreSQL adapters for every remaining mutable domain before public launch.
8. Make `/api/storage/status` and `/api/readiness` report persistent storage readiness before public launch.

## Database connection settings
- `DATABASE_URL`: PostgreSQL connection string.
- `VELVET_DB_POOL_MAX`: optional pool maximum, default `5`.
- `VELVET_DB_SSL=disable`: use only when the database explicitly does not require TLS. Otherwise TLS is enabled.

The connection pool is created lazily on the server. Database credentials must never be exposed through `NEXT_PUBLIC_*` variables.

## Auth rule
`user_demo_owner` is development-only. Production must never silently fall back to the demo owner. `lib/current-owner.ts` throws `AUTH_NOT_CONFIGURED` in production when no authenticated/configured owner is available.

The environment-backed `VELVET_OWNER_USER_ID` is only a temporary seam. When the final auth provider is connected, replace it with the authenticated server session lookup; do not accept owner IDs from untrusted client form fields or query parameters.

## Repository rule
UI, Server Actions and Route Handlers pass `ownerUserId` into repository methods. Repositories also filter by owner. This creates two boundaries: caller context and data query scope.

## Data model
Initial PostgreSQL tables are defined in `db/001_initial.sql` for People, Knowledge, Visits, VisitParticipants, Gifts, Relationships, ScheduleEntries, Captures and TimelineItems.

## Migration behavior
The demo seed data does not need to be migrated to production unless explicitly desired. JSON Import/Export is the preferred user-facing migration mechanism for existing customer lists.

## Release blocker
Do not treat Velvet as production-ready while any user-created mutable domain used by the public MVP is only stored in module memory. A redeploy, cold start or runtime replacement may discard it.
