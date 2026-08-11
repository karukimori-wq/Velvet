# Velvet Auth and Permissions v0.2

## Product scope
Velvet v1.0 is individual-use only. There is no store dashboard, team role hierarchy, shared customer workspace, or staff visibility model.

## Identity
Use the platform MVP identity pattern:
- `workspaceId`: primary scope
- `userId`: acting logged-in user
- `ownerUserId`: workspace owner

`professionalId` is not mandatory in MVP.

All public reads and writes resolve identity through `lib/auth/request-identity.ts`. Repository calls receive `ownerUserId` explicitly; public forms/query parameters must never choose the owner scope.

## Auth modes
- `demo`: local development only.
- `fixed_owner`: private single-user development/testing only.
- `session`: public production mode.

In `session` mode, Velvet currently accepts identity from a trusted upstream auth/session bridge only when the server-only `VELVET_SESSION_BRIDGE_SECRET` matches. The bridge provides `x-velvet-user-id`, `x-velvet-owner-user-id`, and `x-velvet-workspace-id`. Direct public requests without the trusted bridge are rejected.

When a final provider such as Auth.js, Clerk, or another platform identity provider is selected, replace the bridge implementation inside the request-identity adapter rather than changing repository contracts.

## Access rule
A user can read and write only Velvet records scoped to the authenticated user's permitted owner/workspace context. Cross-user access is denied by default.

## Data ownership
Velvet personal-sales records are private to the individual user unless an explicit future sharing feature is designed and approved. No implicit store/operator access exists.

## Sensitive data
Contact information, relationship notes, visit history, gifts, Capture text, and personal knowledge must be treated as sensitive application data. Avoid placing them in logs, traces, analytics payloads, or cross-app operational events.

## Plan entitlement
Free/Pro entitlement is owner-scoped. In PostgreSQL mode the canonical Velvet entitlement record is `velvet_owner_entitlements`. Missing/expired records resolve safely to Free.

## Images
Free plan cannot upload/store Velvet images. Pro image access must be feature-gated server-side, not merely hidden in UI. Image storage/upload transport is still a separate production task.

## Import/export
Only the authenticated owner may import into or export from the scoped Velvet workspace. Export remains available on Free and Pro and may include archived records that are outside the Free normal UI history window.

JSON import is validated before mutation. PostgreSQL imports run in one transaction. Duplicate-name behavior is explicitly selected by the user (`skip` or `create_separate`); Velvet does not merge similar names automatically.

## AI calls
AI capability invocation is user-triggered and scoped to the current owner. Velvet sends only capability-necessary context. AI Platform Core remains the source of truth for AI usage.

## Future sharing
Any future store/team/shared-customer feature requires a new contract version and explicit permission model; it must not be inferred from the current individual-owner model.
