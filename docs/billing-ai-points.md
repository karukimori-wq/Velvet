# Velvet Billing and AI Usage v1.0

See `docs/current-product-contract.md` and `docs/plan-enforcement-spec.md`.

## Plans
Free is JPY 0. Current Free limits include 30 customers, rolling 3-month visible history, no integrated all-history timeline, no Pro voice/follow-up/media/export capabilities.

Pro target display price is **990 JPY/month**. Pro removes the Velvet customer-count limit, exposes retained full history/integrated timeline, and enables current Pro capabilities including voice capture, advanced search, follow-up/`そろそろ`, message drafts, images and JSON export.

Business is future-only and not purchasable/enabled in this release.

## Subscription ownership
Growth Engine is the intended canonical owner for subscription/payment state. Velvet stores only a local entitlement projection in `velvet_owner_entitlements` for feature enforcement.

Current runtime explicitly reports the subscription contract as not approved. Until `professional-platform-contracts` and Growth Engine define/implement the shared checkout/subscription contract, Velvet must not create its own Stripe checkout, payment ledger, or canonical subscription state.

## AI usage
AI Platform Core is canonical for AI activity/usage. Velvet may display usage status but must not create an independent usage ledger.

The AI-point purchase contract is also not approved. Do not fabricate a point wallet, decrement local points, or implement a purchase flow until the shared contract exists.

## Product principle
Paid value is better memory/recall workflow, not unlimited AI. Capture/search should use deterministic local behavior where sufficient and AI Platform Core only where interpretation adds value.

## Storage
Free cannot create/upload customer images. Pro media uses configured R2 storage subject to server-side authorization and practical limits. Downgrade must not silently delete retained media without an explicit retention policy.
