# Velvet Domain Model v1.0

See `docs/current-product-contract.md` for current ownership and release rules.

## Ownership boundary
Velvet does **not** own a separate Person/Customer master. Growth Engine owns canonical Customer identity. Velvet professional records reference `customerId`; a display-name snapshot may be retained only as a resilience/readability snapshot.

Growth Engine also owns canonical Reservation / Visit Schedule, Payment, Sales / Revenue, and business-level customer state. Velvet must not persist competing `salesAmount`, `paymentStatus`, payment-method ledger, receivable ledger, or revenue aggregates.

## CustomerMemory
Professional remembered context keyed by `workspaceId + userId + customerId`.

May contain display-name snapshot, personality/preference/caution notes, conversation/last-interaction summaries, next-topic hint, and structured tags. It is private professional memory, not the Customer master.

## ProfessionalVisit
A Velvet-owned record of an actual professional interaction. It may reference Growth Engine `reservationId` / `visitScheduleId`.

Fields include start/end timestamps, duration, service/seating context, conversation/preference/caution/next-action memo, and summary. Missing optional detail never invalidates a Visit. No canonical payment/sales fields belong here.

## ProfessionalTimeline
Chronological Velvet memory keyed to `customerId`. Event types include visit, conversation, note, gift, schedule, relationship, next_action, and media. Timeline content must not become a shadow payment/sales ledger.

## Capture
Raw user-authored input. It is persisted before organization so AI/rule failure never requires re-entry. Organization may propose memory, preference, next-topic, gift, or schedule candidates. Uncertain inferred changes require user confirmation.

## Gift
Professional memory of gifts received/given, keyed to Growth Engine `customerId`. Gift item/occasion/note are memory context. It is not a Sales/Payment record.

## NextAction
Pro follow-up record with text, open/done status, optional `dueAt`, and completion timestamp. Due dates are display-only in the first release; no push/email notification is implied.

## SoonVisitAlert
Derived, not canonical. It uses Velvet Visit history to estimate a customer's usual visit interval and surface `soon`/`overdue` state. It is Pro-only and controlled by owner preference.

## ScheduleEntry
Velvet-owned display/work-memory schedule entry, optionally linked to `customerId` and/or Growth Engine `visitScheduleId`. Canonical Reservation / Visit Schedule remains Growth Engine-owned.

## Relationship
Explicit professional relationship memory between customer references. Semantic relationships must not be inferred solely from co-occurrence.

## Media
Pro images are stored in R2. Authorized metadata/reference is represented through the customer timeline; R2 object keys are not public authorization tokens.

## Entitlement
`velvet_owner_entitlements` is a Velvet-local projection used to enforce Free/Pro access. It is not canonical subscription payment state. AI usage remains canonical in AI Platform Core.
