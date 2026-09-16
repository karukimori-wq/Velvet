# Velvet Free / Pro Production Readiness v1.0

## Product
- mobile Home / お客様 / 覚える / 予定 flow is coherent on representative iPhone widths
- Search is reachable and useful without AI chat
- Capture preserves customer context through review/save and returns with confirmation
- Customer Detail supports fast recall without exposing unknown/noisy fields
- no visible pinning dependency

## Ownership
- Growth Engine remains canonical for Customer, Reservation/Visit Schedule, Payment and Sales/Revenue
- Velvet stores only professional memory/Visit/timeline/Capture/gift/follow-up/display schedule data keyed to Growth Engine `customerId`
- AI Platform Core owns AI usage
- Platform Admin receives operational state only

## Plans
- Free 31st customer is rejected server-side
- Free history is rolling 3 months and cannot be bypassed by direct history/search/timeline APIs
- Free has no integrated all-history timeline
- Free cannot use Pro voice/message-draft/follow-up/media/export capabilities
- Pro has full retained history, integrated timeline and current Pro capabilities
- Business purchase/integrations remain unavailable

## Auth/privacy
- public production uses Clerk
- trusted bridge is limited to secret-authenticated E2E/service checks
- cross-owner/customer access is denied without existence leaks
- secrets never ship in client bundles
- private Capture/notes/relationships/images are excluded from logs/operational analytics

## Persistence/media
- D1 `velvet` database resolves and `cloudflare/schema.sql` applies
- existing D1 `due_at` migration succeeds
- persistence status and roundtrip are green
- R2 `velvetmedia` upload/read/delete lifecycle is owner/customer authorized
- failed media metadata persistence attempts clean up R2 where possible; known non-transactional edge cases remain documented

## AI
- user-triggered Capture organization preserves raw input before AI
- AI Platform Core failure degrades without losing Capture
- no fabricated AI point wallet/purchase contract

## Billing
Release checkout remains blocked until the shared subscription contract and Growth Engine implementation are approved. Velvet must not solve this by adding local Stripe/payment truth.

## Automated verification
`main` CI must pass responsibility, message draft, recall, memory input, repeat visit, mobile UX, plan, media, auth, soon-alert, due-followup, sorting, search, typecheck and build checks.

Cloudflare Production must separately pass deployment, health/version/contracts/persistence, D1 isolation/professional-memory flow, and R2 lifecycle checks. CI success alone does not prove the latest main revision is deployed.

## Manual release verification
Before public launch, verify on a real iPhone:
- sign up/sign in/sign out
- add customer and capture first memory
- repeat customer capture → review → save → recall
- Free 3-month locked-history experience
- Pro integrated timeline/search/voice/follow-up/`そろそろ`
- Pro image upload/view/delete
- due follow-up display (no push/email)
- drawer/bottom-nav/safe-area/keyboard behavior

## Remaining blockers/debt
- approved subscription checkout/payment contract
- real-device UX sign-off
- current-main Production verification after the next release batch
- final downgrade/media retention policy
- continued query/performance hardening for large Pro customer sets
