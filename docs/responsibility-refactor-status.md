# Responsibility Boundary Refactor Status

Status: `needs_fix` until all legacy write paths are removed and migrations are deployed.

## Target ownership

Growth Engine is canonical for Customer, Reservation / Visit Schedule, Payment, Sales, paymentStatus and salesAmount.

Velvet is canonical for customerId-scoped Professional Memory, Professional Visit records, service context, conversation/preferences/cautions, last interaction summary, next topic/action memo, professional timeline and Recall UI.

## Implemented

- Added `velvet_customer_memories` keyed by `workspace_id + user_id + customer_id`.
- Added `velvet_professional_visits` with no Sales/Payment canonical fields.
- Added `velvet_professional_timeline` keyed by customerId.
- Disabled standalone Customer creation UI.
- Disabled `POST /api/people` Customer creation.
- Replaced Person detail Recall UI with Growth Engine Customer display + Velvet Memory/Timeline.
- Replaced Person edit UI with Professional Memory-only editing.
- Replaced active Visit UI/actions with Professional Visit fields only.
- `POST /api/visits` accepts `customerId`, optional `reservationId` or `visitScheduleId`, and `intent`.
- Updated `docs/integration.md` to the reference-ID contract.

## Legacy migration-only structures

The following remain temporarily for migration/rollback and must not be treated as canonical or receive new production writes:

- `velvet_people`
- `velvet_visits`
- `velvet_visit_participants`
- legacy contact/profile repositories tied to `person_id`

These should be removed after migration scripts/backfill are complete and all Capture/Gift/Schedule/Relationship paths are customerId-based.

## Forbidden fields in new Velvet canonical records

- `salesAmount`
- `paymentStatus`
- `paymentMethod`
- receivable / unpaid / collected amount or status
- Stripe secrets or Stripe payment details

## Remaining work before `ready`

- migrate Capture/Gift/Schedule/Relationship references from legacy `personId` to Growth Engine `customerId` where those features remain customer-specific;
- migrate/import existing legacy data into customerId-scoped memory/timeline only when an explicit Growth Engine customer mapping exists;
- remove legacy DB write code and then drop/archive legacy Customer/Sales/Payment-shaped columns/tables;
- add contract tests asserting Velvet cannot create Customer or persist Sales/Payment canonical fields;
- verify Growth Engine customer display endpoint contract and authentication in deployed environments.
