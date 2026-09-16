# Velvet Current Product Contract

Updated for the Free / Pro release work in September 2026. When an older Velvet document conflicts with this file, `docs/plan-enforcement-spec.md`, `docs/codex-system.md`, current code, or `professional-platform-contracts`, the newer/current source wins.

## Product
Velvet is a mobile-first professional customer-memory app. Its core loop is **覚える → 思い出す → 次につなぐ**. AI stays in the background and may reduce typing, organization, and search effort; it is not the product itself.

## Canonical ownership
Growth Engine is canonical for Customer, Reservation / Visit Schedule, Payment, Sales / Revenue, and business-level customer state. Velvet references Growth Engine `customerId` and may keep a display-name snapshot for resilience, but must not create a competing Customer master or payment/sales ledger.

Velvet is canonical for professional Visit history, service/conversation notes, preferences/cautions, Capture, confirmed professional memory, customer-specific professional timeline, gifts recorded as professional memory, follow-up/next-action records, and Velvet-owned display schedule entries.

AI Platform Core is canonical for AI runtime/activity/usage. Platform Admin receives operational status only. Feedback Hub receives support/feedback context under its contract.

## Release plans
### Free
- up to 30 customers
- rolling 3-month visible history
- dated records can be opened individually inside the visible window
- no integrated all-history timeline
- basic keyword search
- text/stamp capture
- no voice capture
- no message drafts
- no Pro follow-up management / `そろそろ`
- no image upload
- no JSON export

### Pro
Target display price: **990 JPY/month**. Price display is not an entitlement source.

- no Velvet customer-count limit
- full retained history
- integrated chronological timeline
- advanced/full-history search
- voice-assisted capture
- message drafts
- follow-up management with optional due date
- `そろそろ` visit-cycle display, user-toggleable
- images/attachments
- JSON export

Due follow-ups and `そろそろ` are display surfaces for the first release. Velvet does not send push/email notifications for them.

### Business
`business` is reserved for platform compatibility only. Business is not purchasable, publicly exposed, or enabled in this release. `business.integrations` remains disabled. Future Business capabilities must consume Growth Engine-owned business data through approved contracts.

## Billing
Growth Engine is the intended canonical owner for subscription/payment flows. Velvet currently holds only an entitlement projection (`velvet_owner_entitlements`). The subscription checkout/payment contract and AI-point purchase contract are not yet approved, so Velvet must not implement its own Stripe/payment source of truth.

## Runtime
Current Cloudflare production architecture:
- Cloudflare Workers / OpenNext
- D1 binding `DB`, database name `velvet`
- R2 binding `MEDIA`, bucket `velvetmedia`
- Clerk authentication in public production
- trusted session bridge retained for production E2E/service checks
- AI Platform Core via service binding/HTTP fallback as configured

`wrangler.jsonc` contains a placeholder D1 database UUID in source; the production workflow resolves the actual `velvet` D1 database and replaces the placeholder before deployment.

## UX
Primary mobile navigation is Home / お客様 / 覚える / 予定. Search is available as a first-class screen and from the drawer/customer surfaces. Capture is the emphasized action.

Customer Detail is one vertical recall surface: identity, quick actions, recall, known memory, follow-ups, images when entitled, then history/timeline. Unknown fields are hidden. Pinning is not a promoted UI concept.

## Security/privacy
Every private operation is scoped by authenticated `workspaceId` + `userId` / `ownerUserId`. Never trust client-supplied identity. Raw Capture, private notes, contact/relationship data, images, and payment data must not enter operational logs/analytics unless an explicit contract requires the minimum necessary field.

## Release verification
CI must keep responsibility, plan, auth, media, recall, follow-up, sorting, search, mobile UX, typecheck, and build guards green. Cloudflare Production verification is separate from CI; a green main branch does not mean the latest commit has been deployed or production-verified.
