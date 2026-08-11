# Velvet MVP Production Readiness

Velvet is ready for public MVP only when all applicable items below pass.

## Product
- Core UX remains user-directed; no unsolicited daily-sales coaching becomes the home focus.
- People, Visit, Capture, Search, Schedule work on smartphone layouts.
- Common actions meet the interaction targets defined in `product-principles.md` where practical.

## Data ownership
- Velvet personal Person/Guest domain is distinct from Growth Engine Customer.
- No independent AI usage ledger is treated as canonical in Velvet.
- SNS Planner receives no automatic private guest dataset.
- Platform Admin stores only operational snapshots.

## Privacy and security
- Every private record is owner-scoped server-side.
- Cross-owner ID access returns not-found/forbidden without leaking existence.
- Raw Capture, contact details, private relationships, payment/receivable details and images are excluded from operational events/logs.
- Secrets/API keys never ship to client bundles.
- Image access uses authenticated/authorized paths.
- Export is owner-authorized.

## Plans
- People unlimited on Free and Pro.
- Free historical UI access is rolling one year and enforced across direct fetch, timeline, search and AI-assisted search.
- Free cannot upload images.
- Pro has full historical access and image entitlement.
- Downgrade policy is documented before launch.

## AI
- AI actions are user-triggered.
- Capture raw input survives AI failure.
- AI-derived mutations require confirmation when inference is involved.
- AI Platform Core owns usage accounting.
- Free/Pro point pricing differences are server-enforced.
- Insufficient points fail safely without losing user input.

## Import/export
- JSON schema is versioned.
- Import has validation and preview.
- Invalid import is atomic or safely rollback-capable.
- Duplicate handling is explicit.
- Export works for Free and Pro under documented policy.

## Observability
- `/health`, `/version`, `/contracts/status` are public/operationally accessible as intended.
- `status` uses only success/warning/error/skipped at the observability level.
- traceId/correlationId/requestId are propagated/generated consistently.
- CORS/OPTIONS works for required cross-app integrations.
- Error responses use stable error codes.

## Integration
- professional-platform-contracts includes Velvet ownership boundary.
- AI Platform Core capability contracts are compatible.
- SNS Planner handoff is reference/minimum-context based.
- Platform Admin recognizes Velvet health/contracts surfaces.

## UX regression checks
Before release, manually test on representative smartphone widths:
- create Person with name only
- search Person
- start/end Visit
- multi-person Visit
- payment quick choice
- gift received/given
- short Capture
- voice/self-memo Capture where supported
- AI organization confirmation
- timeline
- Schedule entry
- Free archive boundary
- Pro image upload
- JSON import preview
- data export

## Launch blockers
Any of these block release:
- cross-user data access
- destructive plan downgrade without explicit policy
- AI mutation without required confirmation
- source-of-truth conflict with platform contracts
- private guest content in Platform Admin/logs/events
- Free history restriction bypass through alternate API/search path
- image entitlement bypass
- import capable of silent malformed partial writes
