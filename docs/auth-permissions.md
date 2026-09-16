# Velvet Auth and Permissions v1.0

## Identity
MVP identity is `workspaceId + userId`, with `ownerUserId` for owner-level entitlement/preferences. `professionalId` is not required.

All private reads/writes resolve identity server-side through `lib/auth/request-identity.ts`. Client form/query values cannot choose another user's scope.

## Auth modes
- `clerk`: current public production mode
- `session`: trusted session-bridge mode
- `fixed_owner`: development/testing only; forbidden in public production
- `demo`: local/safe preview only; forbidden in normal production

In Clerk mode, ordinary browser identity comes from Clerk. A request carrying the server-only `VELVET_SESSION_BRIDGE_SECRET` may use trusted identity headers for production E2E/service checks. Untrusted public headers do not select identity.

## Data access
Customer-related professional records require the authenticated `workspaceId + userId + customerId` scope. `customerId` references Growth Engine Customer; it does not grant access by itself.

## Entitlements
`velvet_owner_entitlements` is a local feature-access projection. Missing/inactive entitlement resolves safely to Free. It is not canonical payment/subscription state.

## Plan permissions
Free: 30-customer limit, rolling 3-month history, no integrated full timeline, no voice/message-draft/follow-up/media/export bypass.

Pro: full retained history and current Pro capabilities. Business integration remains disabled even though `business` is recognized as a compatibility PlanId.

## Media
Free upload is rejected server-side. Pro R2 upload/read/delete requires owner/customer authorization. Object keys are not authorization credentials.

## Export
JSON export is Pro-only under the current release policy and must remain owner-authorized. Export must not become a hidden bypass for another user's data.

## Sensitive data
Raw Capture, professional notes, relationship context, visit history, gifts, images and contact/memory data are sensitive. Do not place them in operational logs, analytics, Platform Admin, or cross-app events unless a contract explicitly allows the minimum necessary field.

## Future sharing
Team/store/shared-customer access requires a new explicit permission contract. Do not infer shared access from the current individual-owner model.
