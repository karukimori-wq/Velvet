# Velvet Coding Rules v1.0

## Authority
Read `docs/current-product-contract.md`, `docs/plan-enforcement-spec.md`, and current code before older design/domain documents. `professional-platform-contracts` is authoritative for cross-app contracts.

## Architecture
- domain logic stays outside visual components
- Growth Engine `customerId` is the customer reference; do not create a competing Velvet Customer/Person master
- Growth Engine owns Reservation/Visit Schedule, Payment and Sales/Revenue truth
- Velvet owns professional Visit/memory/timeline/Capture/gift/follow-up/display-schedule data
- AI Platform Core owns AI runtime/activity/usage
- Platform Admin receives operational state only

## Data
- scope private records server-side by authenticated workspace/user/owner context
- missing optional data is valid
- Free history limits are visibility rules, not destructive deletion
- plan restrictions require server-side enforcement
- do not persist canonical sales amount, payment status, receivable ledger or revenue aggregates in Velvet

## Capture
- persist raw Capture before AI/rule processing
- processing failure must not discard raw input
- uncertain inferred changes require confirmation
- retry should reuse stored raw Capture where possible

## UI
- mobile-first and one-thumb friendly
- primary product verbs: 覚える / 思い出す / 次につなぐ
- common actions target <=3 taps
- avoid modal chains and unnecessary keyboard opening
- do not promote pinning as core customer organization
- do not add UI merely to expose AI
- Business purchase/integration UI remains unavailable

## Plans
Free: 30 customers, rolling 3-month history, no integrated full timeline, no Pro voice/follow-up/media/export/message-draft bypass.

Pro: full retained history/integrated timeline plus current Pro capabilities. `business` may be recognized for compatibility but `business.integrations` stays disabled.

## Persistence
Cloudflare D1/R2 is the current production path. PostgreSQL/in-memory code is compatibility/development support. New persistence work must verify D1 behavior and production workflow migration implications.

## Observability/privacy
Top-level operational status uses `success | warning | error | skipped`. Preserve trace/correlation/request identifiers where defined. Never log raw Capture, private notes, customer relationship context, images, credentials or payment details.

## Testing priority
Prioritize ownership isolation, plan enforcement, Capture preservation, history-window bypass prevention, media authorization, follow-up/`そろそろ`, mobile UX, D1 migration/readiness and cross-app responsibility guards.

## Scope discipline
Do not add POS, payroll, tax filing, automatic messaging, proactive sales scoring, canonical billing, or Business features to the Free/Pro release without an explicit approved contract/requirement.
