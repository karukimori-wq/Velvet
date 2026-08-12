# Codex System Instructions — Velvet

You are implementing Velvet, a mobile-first night-work Professional App connected to Growth Engine.

## Product priority
Velvet wins on convenience, simplicity, and recall speed. The user decides what to do. AI stays in the background and should reduce taps, typing, repeated entry, and searching effort.

Do not turn Velvet into an unsolicited AI coaching dashboard.

## Read these first
Before changing code, read:
- `README.md`
- `docs/product-principles.md`
- `docs/product-requirements.md`
- `docs/ux-spec.md`
- `docs/person-detail-recall-spec.md`
- `docs/domain-model.md`
- `docs/data-model.md`
- `docs/database-schema.md`
- `docs/api-spec.md`
- `docs/auth-permissions.md`
- `docs/billing-ai-points.md`
- `docs/integration.md`
- `docs/coding-rules.md`
- current sprint document

Also follow `professional-platform-contracts`, especially `app-responsibilities.md` and `data-ownership.md`.

## Non-negotiable ownership rule
Growth Engine is canonical for:
- Customer
- Reservation / Visit Schedule
- Payment
- Sales / Revenue
- customer-level sales aggregation
- repeat/referral/contact-measure Business state

Velvet is canonical for:
- professional Visit history
- service notes
- preferences / cautions
- conversation notes
- previous handling
- next-topic / next-contact memo
- customer-specific professional timeline
- Capture and confirmed professional memory

Velvet MUST NOT persist a competing Customer master, canonical `salesAmount`, canonical `paymentStatus`, Payment ledger, Sales/Revenue ledger, Reservation source of truth, Stripe secrets or payment credentials.

Where integrated, professional memory is keyed/reference-linked by Growth Engine `customerId`.

## Plan value
### Pro — JPY 10,000/month
Core value: **顧客を忘れない・接客品質を上げる**.

The Pro experience should make it possible to remember important customer context in roughly 10 seconds before service. Prioritize recall, previous conversation, preferences/cautions, professional timeline, AI memo organization, AI reply/contact drafts, search and important-customer pinning.

### Business — JPY 30,000/month
Core value: **来店・売上・リピートを増やす**.

Business is Growth Engine-powered business mode. Customer sales, sales trends, visit-interval analysis, repeat candidates, dormant customers, referrals, contact measures, sales dashboard and AI sales suggestions must use Growth Engine canonical Business data rather than duplicating it in Velvet.

## Growth Engine integration
Growth Engine -> Velvet default input:
- `workspaceId`
- `userId`
- `customerId`
- `reservationId` or `visitScheduleId`
- `intent`

Velvet -> Growth Engine where needed:
- `visitId`
- `noteId`
- `lastVisitAt`
- `nextActionRef`
- `summaryRef`

Do not return raw confidential note bodies or full conversation text by default.
Do not request or accept `paymentStatus`, `salesAmount`, Stripe secrets or unrelated payment data unless a future explicit contract requires a minimum necessary field.

## Non-negotiable UX rules
1. Common actions should normally complete within three taps.
2. Avoid opening the keyboard unless needed.
3. Never require optional data before completing a Visit flow.
4. Do not show empty customer fields in the recall view.
5. Customer Detail is optimized for rapid recall when the customer arrives.
6. Prioritize: identity/minimum display, previous recall summary, personality/preferences/cautions, quick actions, professional timeline.
7. Show only known information. Never render rows such as `未入力`.
8. Professional timeline is a primary surface, not a secondary audit screen.
9. AI-derived uncertain changes require user confirmation before becoming canonical Velvet professional memory.
10. Never discard raw Capture input when parsing/AI fails.
11. Suggestions may be ranked, but uncertain values are not silently auto-committed.
12. The home screen must not foreground unsolicited `today you should...` recommendations.

## Customer recall view
The detail view must help the user remember someone in seconds.

Known professional context may include:
- occupation/company when contractually available or user-recorded as professional memory
- interests/hobbies
- favorite drinks/food
- NG topics
- marital-status value if entered
- appearance memories such as hairstyle, hair color, clothing/style, facial features, glasses
- accessories/belongings such as watch, watch brand, wallet brand, jewelry
- useful user-entered personality traits

Hide any unknown item entirely.

Timeline may include:
- professional visits
- seating reason
- gifts received/given
- conversation/service notes
- Capture-derived memory
- schedule references/events
- relationships/referrals

Do not embed canonical sales/payment state into the Velvet timeline. Business sales data is Growth Engine-owned.

## Visit rules
- Start uses current timestamp.
- End is one tap from active Visit and calculates duration.
- Departure may remain unknown.
- Shared multi-person Visit context is entered once.
- Seating reason is Visit context, not a permanent Customer property.
- Canonical Reservation / Visit Schedule remains Growth Engine-owned.
- A Velvet Visit may store `reservationId` / `visitScheduleId` references.

## AI rules
AI is user-triggered and utility-oriented.

Prefer deterministic local behavior for timestamps, duration, explicit stamp selections, exact saved values and simple ranked recent/frequent suggestions.

Use AI Platform Core only where interpretation adds real value, such as structuring ambiguous Capture or parsing natural-language search intent.

Do not send full private datasets when references or scoped context are sufficient.

## SNS rule
SNS Planner owns PostDraft. Growth Engine owns campaign/business intent. Velvet only hands off intentionally selected context through an explicit user action.

## Entitlement rules
Plan and feature entitlement enforcement must be server-side. Business access must not cause Growth Engine canonical data to be copied into Velvet as a new source of truth.

## Coding behavior
- Prefer small composable functions/components.
- Keep domain logic outside visual components.
- Use stable typed identifiers and enums.
- Preserve traceId/correlationId/requestId through integrations.
- Observability top-level status is one of `success`, `warning`, `error`, `skipped`.
- Do not log PII, raw Capture, payment details, private relationship data, or images.
- Do not invent new cross-app contracts locally; update/consult professional-platform-contracts.

## Implementation order
Follow the current sprint scope. Do not opportunistically implement later-sprint features merely because they are easy.

When a specification appears to conflict, prioritize:
1. latest explicit product requirement
2. professional-platform-contracts ownership rules
3. product principles / recall spec
4. current sprint
5. general older specification

If a conflict remains, stop before creating a competing source of truth.
