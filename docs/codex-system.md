# Codex System Instructions — Velvet

You are implementing Velvet, a mobile-first customer-memory and service-support app for individual night-work professionals.

## Product priority
Velvet wins on convenience, simplicity, and recall speed. The user decides what to do. AI stays in the background and should reduce taps, typing, repeated entry, and searching effort.

Do not turn Velvet into an unsolicited AI coaching dashboard.

## Release scope — authoritative
The current release target is **Free + Pro**.

Free:
- customer management: up to 30 customers
- history browsing: rolling 3 months
- dated interactions/events can be registered
- no integrated all-history timeline

Pro:
- customer management: no Velvet plan limit
- retained history: unlimited by plan policy
- integrated chronological timeline
- event views alongside the timeline

Business is future work. `business` may remain recognized as a platform PlanId for compatibility, but it is not purchasable, publicly exposed, or enabled in Velvet for the current release. Do not implement Business product features unless a later explicit requirement changes this.

Do not treat prices written in older documents as authoritative. Pricing must not be hard-coded into platform contracts.

## Context loading — keep it small
Start with:
1. `AGENTS.md`
2. this file
3. the smallest task-specific specification(s)
4. current code in the area being changed
5. `professional-platform-contracts` only when formal cross-app contracts/ownership are involved

Do not read every document by default. Load only what materially affects the task. For UI work, prefer `docs/ux-spec.md`, `docs/ui-spec.md`, and the relevant interaction spec. For plan work, prefer `docs/plan-enforcement-spec.md`. For persistence work, prefer `docs/data-model.md`, `docs/database-schema.md`, and `docs/persistence-setup.md`.

Before substantial coding, persistence, authentication, integration, AI capability, deployment, or production-readiness work, consult the configured development-intelligence source required by `AGENTS.md`, then verify remembered guidance against current code/runtime.

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
8. On Pro, the integrated professional timeline is a primary surface.
9. On Free, do not expose an integrated all-history timeline; dated detail is accessed within the allowed history window.
10. AI-derived uncertain changes require user confirmation before becoming canonical Velvet professional memory.
11. Never discard raw Capture input when parsing/AI fails.
12. Suggestions may be ranked, but uncertain values are not silently auto-committed.
13. The home screen must not foreground unsolicited `today you should...` recommendations.

## Customer recall view
The detail view must help the user remember someone in seconds.

Known professional context may include occupation/company when contractually available or user-recorded as professional memory, interests/hobbies, favorite drinks/food, NG topics, user-entered relationship/life context, appearance memories, accessories/belongings, and useful user-entered personality traits.

Hide any unknown item entirely.

Timeline/event detail may include professional visits, seating reason, gifts received/given, conversation/service notes, Capture-derived memory, schedule references/events, and relationships/referrals.

Do not embed canonical sales/payment state into the Velvet timeline. Future Business sales data is Growth Engine-owned.

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

## Autonomous implementation loop
For an authorized task, continue through:
1. inspect the smallest relevant context
2. implement
3. typecheck and run relevant policy checks/tests
4. investigate failures and fix root causes
5. rerun affected checks
6. verify the user-visible flow when UI behavior changed
7. update documentation when the stable contract/behavior changed
8. record only reusable development learning according to `AGENTS.md`
9. continue to the next executable task in scope

Do not ask for confirmation after every small step. Stop when a genuine product decision, credential/secret, destructive action, external authorization, unresolved source-of-truth conflict, or other defined stop condition requires the owner.

## Verification rule
A code change is not complete merely because it compiles. Use the narrowest relevant checks first, then broader checks when the change crosses boundaries. UI changes require a browser/visual interaction check when an available environment/tool permits it. If browser verification is unavailable, state that limitation rather than claiming visual success.

## Feedback loop
When a failure is fixed, distinguish:
- environment/configuration failure
- code defect
- stale specification/context
- contract/ownership conflict
- test/check defect

Update durable instructions or checks only when the learning is reusable. Prefer strengthening an existing rule/check over adding duplicate documentation.

## Coding behavior
- Prefer small composable functions/components.
- Keep domain logic outside visual components.
- Use stable typed identifiers and enums.
- Preserve traceId/correlationId/requestId through integrations.
- Observability top-level status is one of `success`, `warning`, `error`, `skipped`.
- Do not log PII, raw Capture, payment details, private relationship data, or images.
- Do not invent new cross-app contracts locally; update/consult professional-platform-contracts.

## Implementation priority
When a specification appears to conflict, prioritize:
1. latest explicit product requirement
2. professional-platform-contracts ownership rules
3. `docs/plan-enforcement-spec.md` for current plan behavior
4. product principles / recall spec
5. current sprint/task scope
6. older general specification

If a conflict remains, stop before creating a competing source of truth.
