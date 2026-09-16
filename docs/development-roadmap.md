# Velvet Development Roadmap v1.0

See `docs/current-product-contract.md` and `docs/plan-enforcement-spec.md` for current product rules.

## Release goal
Ship Velvet Free + Pro as a fast mobile customer-memory product whose core loop is **覚える → 思い出す → 次につなぐ**. Business remains future work.

## Completed / implemented foundation
- Cloudflare Workers/OpenNext runtime
- D1-backed professional memory repositories and production roundtrip checks
- R2 `MEDIA` storage with authenticated Pro media lifecycle
- Clerk production auth path plus trusted E2E bridge
- Growth Engine customer reference boundary
- AI Platform Core capture/search support with deterministic fallback
- Platform operational endpoints and CI policy guards

## Free / Pro product completion
### People and recall
- Free: up to 30 customers, rolling 3-month visible history, event-by-event history
- Pro: no Velvet customer limit, full history, integrated timeline
- customer sorting by name/recent visit/visit count; Pro adds follow-up/`そろそろ` discovery
- pinning is not a promoted product surface

### Capture
- fast customer selection
- stamps/text and structured confirmation
- raw Capture preserved before organization
- Pro voice input
- post-save return to customer with clear confirmation and continue action

### Follow-up
- Pro next actions
- optional due date
- due items surfaced on Home/customer detail
- `そろそろ` inferred from Velvet visit cadence and user-toggleable
- first release is display-only: no push/email notification

### Search
- Free basic keyword search
- Pro full-history/advanced search
- deterministic parsing preferred when sufficient; AI remains background infrastructure

### Media/export
- Free image upload blocked server-side
- Pro R2 images/attachments
- Pro JSON export
- retention/downgrade behavior must never silently delete data

## Current release work
1. Finish mobile UX consistency and real-device verification.
2. Reduce D1 query fan-out on Home/People as customer counts grow.
3. Harden empty/error/loading states and accessibility.
4. Confirm privacy/cache/security headers for sensitive customer pages.
5. Verify AI Platform Core graceful degradation under production failure.
6. Run one batched Cloudflare Production verification after the current main changes settle.

## External blockers
Subscription checkout/payment remains blocked until the shared subscription contract and Growth Engine implementation are approved. Velvet must not implement its own Stripe/payment source of truth. AI-point purchase is also blocked until its shared contract exists.

## Business after release
Business may consume approved Growth Engine-owned reservation/sales/payment/customer aggregates. Do not add Business purchase UI or Business-only integrations to the Free/Pro release.

## Non-goals
Do not add POS, payroll, tax filing, automatic LINE sending, canonical sales/payment ledgers, unsolicited AI coaching, or store-management dashboards to Velvet Free/Pro.
