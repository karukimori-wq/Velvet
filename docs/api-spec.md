# Velvet API Specification v1.0

Current route handlers are authoritative. This document defines the API boundary rather than inventing unused Person/Sales endpoints.

## Conventions
- base path `/api`
- top-level operational status: `success | warning | error | skipped`
- identity resolved server-side; `workspaceId/userId/ownerUserId` from ordinary request bodies are not trusted
- `professionalId` not required in MVP
- preserve trace/correlation/request identifiers where shared contracts define them

## Customer professional memory
Customer routes use Growth Engine `customerId` references.

Current families include customer memory, timeline, notes and next-actions. These APIs read/write Velvet professional memory only. They must not expose or create canonical Growth Engine Payment/Sales/Reservation state.

## Visits
Velvet Visit APIs create/read/update/end professional Visit history. A Visit may reference Growth Engine reservation/schedule IDs. Visit endpoints do not accept canonical sales/payment state as Velvet truth.

## Capture
Raw Capture is persisted before organization. User-triggered organization may call AI Platform Core and returns/proposes structured memory; uncertain inferred changes require confirmation. AI failure must preserve raw input and permit deterministic fallback/retry.

## Search
Free basic search respects the rolling 3-month visibility policy. Pro may search retained full history and use deterministic natural-language-like parsing or AI Platform Core where useful. AI never becomes the customer database.

## Media
Pro media APIs provide status/upload/authenticated retrieval/deletion against R2. Free direct upload bypass attempts return a plan error. Media access must verify owner/customer scope.

## Import/export
Import is owner-scoped and validated. Current JSON export is Pro-only. Do not expose protected history or cross-owner records through an alternate export/search route.

## Entitlement/billing
Velvet exposes plan/readiness information but does not own canonical subscription payment. Growth Engine is the intended payment/subscription owner; shared checkout contract is not yet approved. AI Platform Core owns AI usage.

## Operational endpoints
Current production verification relies on endpoints including:
- `/api/health`
- `/api/version`
- `/api/contracts/status`
- `/api/persistence/status`
- `/api/persistence/roundtrip`

Operational responses must not contain private customer content.

## Errors
Use stable machine-readable codes for validation, authorization, plan restrictions and integration failures. Do not leak whether another owner's private record exists.
