# Velvet Auth and Permissions v0.1

## Product scope
Velvet v1.0 is individual-use only. There is no store dashboard, team role hierarchy, shared customer workspace, or staff visibility model.

## Identity
Use the platform MVP identity pattern:
- `workspaceId`: primary scope
- `userId`: acting logged-in user
- `ownerUserId`: workspace owner

`professionalId` is not mandatory in MVP.

## Access rule
A user can read and write only Velvet records scoped to the user's permitted workspace/user context. Cross-user access is denied by default.

## Data ownership
Velvet personal-sales records are private to the individual user unless an explicit future sharing feature is designed and approved. No implicit store/operator access exists.

## Sensitive data
Contact information, relationship notes, visit history, gifts, and personal knowledge must be treated as sensitive application data. Avoid placing them in logs, traces, analytics payloads, or cross-app events.

## Images
Free plan cannot upload/store Velvet images. Pro image access is feature-gated server-side, not merely hidden in UI.

## Import/export
Only the authenticated owner may import into or export from the scoped Velvet workspace. Export remains available on Free and Pro.

## AI calls
AI capability invocation must be authorized for the current user and point balance before execution. The user triggers the call. Velvet sends only capability-necessary context.

## Future sharing
Any future store/team/shared-customer feature requires a new contract version and explicit permission model; it must not be inferred from the current `workspaceId` model.
