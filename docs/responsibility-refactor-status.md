# Responsibility Boundary Refactor Status

Status: `ready`

The responsibility-boundary refactor is complete at the application/code-contract level. Database migrations still need to be applied in each deployed environment through the normal deployment process, but legacy Customer/Sales/Payment-shaped stores are no longer product write targets.

## Canonical ownership

### Growth Engine is canonical for

- Customer
- Reservation / Visit Schedule
- Payment
- Sales
- paymentStatus
- salesAmount
- customer sales totals
- visit schedules
- repeat candidates
- referrals
- business analytics

### Velvet is canonical for

- customerId-scoped Velvet Customer Memory
- Professional Memory / Professional Profile notes
- Professional Visit record
- conversation memo
- preference memo
- caution memo
- previous-interaction summary
- next-topic / next-action memo
- customerId-scoped professional timeline
- Recall UI
- customerId-scoped Capture
- customerId-scoped Gift records
- customerId / visitScheduleId-scoped Schedule notes
- customerId-to-customerId Relationship notes

## Completed implementation

- `velvet_customer_memories` is keyed by `workspace_id + user_id + customer_id` and stores only Velvet professional memory.
- `velvet_professional_visits` stores Professional Visit context only and has no canonical Sales/Payment fields.
- `velvet_professional_timeline` is keyed by customerId.
- `velvet_professional_captures` uses customerId, not personId.
- `velvet_professional_gifts` uses customerId, not personId.
- `velvet_professional_schedule_entries` uses customerId and optional Growth Engine `visitScheduleId`.
- `velvet_professional_relationships` uses `customer_a_id` / `customer_b_id`.
- Customer detail/edit routes use `/people/[customerId]`; the old `[personId]` route has been removed.
- Customer creation is disabled in UI, Server Actions and `POST /api/people`.
- Customer contact master writes are disabled in Velvet API; contacts shown in Recall are Growth Engine references.
- JSON import/export v2.0 accepts/exports customerId-scoped Velvet Professional Memory only. It cannot create Customer, Customer contacts, rank or Customer profile fields.
- Home, People and Search no longer depend on `velvet_people` as the product Customer source.
- Active Visit UI has no Sales, Payment, paymentStatus, salesAmount, receivable or Stripe input.
- Growth Engine integration uses reference IDs: `workspaceId`, `userId`, `customerId`, optional `reservationId` / `visitScheduleId`, and `intent`.
- Velvet return contract is limited to `visitId`, `noteId`, `lastVisitAt`, `nextActionRef`, `summaryRef` as applicable.

## Legacy migration / rollback structures

The following historical tables and adapters remain only so old data can be inspected during migration/rollback:

- `velvet_people`
- `velvet_knowledge`
- `velvet_visits`
- `velvet_visit_participants`
- legacy person contact/profile tables
- other historical personId-scoped records created before the boundary refactor

`lib/person-store.ts` and `lib/visit-repository.ts` expose legacy reads for migration/rollback only. Every legacy write helper is blocked with an explicit read-only error. Product code must not use these stores as canonical sources.

Historical migration SQL files are retained as migration history; their old columns do not define current product ownership.

## Forbidden fields in new Velvet canonical records

- `salesAmount` / `sales_amount`
- `paymentStatus` / `payment_status`
- `paymentMethod` / `payment_method`
- receivable / unpaid / collected amount or collection state
- Stripe secrets or Stripe payment details
- Customer name/contact/rank as Velvet canonical fields

If display name or contacts are shown, they are Growth Engine Customer reference results or non-canonical display snapshots only.

## Automated boundary guard

CI runs `npm run check:responsibility` before typecheck/build. It fails if:

- canonical Velvet repositories/API return to personId/person_id;
- Professional Visit gains Sales/Payment fields;
- `velvet_people` / `velvet_visits` receive write SQL in legacy adapters;
- People/Contacts APIs regain Customer-master creation paths;
- JSON import/export regains Velvet Customer/contact-master creation.

## Definition of Done re-evaluation

| Requirement | Result | Evidence |
| --- | --- | --- |
| New canonical code uses customerId, not personId | PASS | Memory, Visit, Capture, Gift, Schedule, Relationship repositories and routes are customerId-scoped; `/people/[customerId]` is the active route. |
| Velvet cannot create/edit Customer master | PASS | Customer creation UI/API disabled; edit screen writes only Velvet Customer Memory; contact-master POST disabled. |
| Velvet does not newly save Sales/Payment canonical data | PASS | Professional Visit model/storage/UI omit Sales, Payment, paymentStatus, salesAmount, receivable and Stripe fields. |
| Recall UI / Timeline / Memo retained | PASS | Customer detail reads Growth Engine display data plus Velvet Memory/Professional Timeline. |
| Professional Visit retained | PASS | `velvet_professional_visits` remains the Velvet visit source for professional context/memos. |
| Legacy tables are read-only | PASS | legacy Person/Visit write helpers throw explicit read-only errors; automated CI checks prevent SQL writes returning. |
| Growth Engine integration is reference-ID based | PASS | `workspaceId`, `userId`, `customerId`, optional `reservationId`/`visitScheduleId`, `intent`; no Sales/Payment transport contract. |
| Responsibility boundary automated test passes | PASS | GitHub Actions Responsibility boundary step succeeds. |
| TypeScript typecheck passes | PASS | GitHub Actions Typecheck step succeeds. |
| Production build passes | PASS | GitHub Actions Build step succeeds. |

## Final assessment

Responsibility-boundary refactor: `ready`.

This means the Velvet application architecture now conforms to the canonical ownership contract. Deployment readiness remains separately dependent on applying the current database migrations and configuring the deployed Growth Engine/auth/storage endpoints.
