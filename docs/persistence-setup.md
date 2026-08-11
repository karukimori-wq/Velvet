# Velvet Persistence & Auth Setup

## Current state
Velvet can run in development with in-memory repositories and the demo owner. This mode is intentionally not production-ready.

## Production requirements
1. Configure a real authentication provider and make the authenticated account resolve to an owner user ID.
2. Set `VELVET_STORAGE_MODE=postgres`.
3. Set `DATABASE_URL` to the production PostgreSQL connection string.
4. Apply `db/001_initial.sql`.
5. Replace the in-memory repository implementations behind the existing repository seams with PostgreSQL implementations.
6. Verify every private query includes `owner_user_id`.
7. Make `/api/storage/status` return `status: success` and `persistent: true` before public launch.

## Auth rule
`user_demo_owner` is development-only. Production must never silently fall back to the demo owner. `lib/current-owner.ts` throws `AUTH_NOT_CONFIGURED` in production when no authenticated/configured owner is available.

The environment-backed `VELVET_OWNER_USER_ID` is only a temporary seam. When the final auth provider is connected, replace it with the authenticated server session lookup; do not accept owner IDs from untrusted client form fields or query parameters.

## Repository rule
UI, Server Actions and Route Handlers should pass `ownerUserId` into repository methods. Repositories must also filter by owner. This creates two boundaries: caller context and data query scope.

## Data model
Initial PostgreSQL tables are defined in `db/001_initial.sql` for People, Knowledge, Visits, VisitParticipants, Gifts, Relationships, ScheduleEntries, Captures and TimelineItems.

## Migration behavior
The current demo seed data does not need to be migrated to production unless explicitly desired. JSON Import/Export is the preferred user-facing migration mechanism for existing customer lists.

## Release blocker
Do not treat Velvet as production-ready while any user-created data is only stored in module memory. A redeploy, cold start or runtime replacement may discard it.
