# Sprint 06 — Import/Export, Billing, Integrations & Production Readiness

## Goal
Complete the surfaces required to operate Velvet as a paid MVP without weakening low-friction UX or data-ownership boundaries.

## Scope

### JSON import
- Settings -> Import.
- Show copyable conversion instructions/prompt and current JSON schema.
- User may transform Excel/CSV/other source data with an external AI.
- Velvet validates JSON, reports errors, shows a preview, then imports after explicit confirmation.
- Duplicate handling is explicit: skip, create separate, or user-approved merge. Never auto-merge solely on similar names.
- Do not automatically upload source Excel/CSV to AI Platform Core.

### Export
- Free and Pro can export their own Velvet data.
- Export is owner-scoped.
- JSON first; CSV may be added for flat datasets.
- Free historical UI limits are not artificial data lock-in.

### Pro subscription
- Target JPY 10,000/month.
- Server-side entitlement is authoritative.
- Benefits: full history, images, advanced features/integrations, lower AI point unit pricing.
- Do not repeatedly interrupt normal work with upgrade prompts.
- Downgrade must not silently destroy historical data or images.

### AI points
- Free and Pro can purchase points; Free unit price is higher.
- AI Platform Core is canonical for AI usage accounting.
- Velvet displays balance/usage state but does not own an independent authoritative usage ledger.
- Do not show a confirmation dialog for every small charge; show costs unobtrusively and notify at low/insufficient balance.

### SNS Planner
- Handoff is user-triggered only.
- Send only user-selected posting intent/context and permitted references.
- Never automatically send guest contacts, raw private notes, full visit/gift history, payment/receivable data, or private relationship graphs.

### AI Platform Core
- User-triggered Capture structuring and natural-language search intent parsing.
- Maintain traceId/correlationId/requestId and minimize payloads.
- Velvet owns Velvet business data; AI Platform Core owns AI execution and usage.

### Platform Admin
Expose `GET /health`, `GET /version`, `GET /contracts/status`. Operational responses/logs must not include guest PII, raw Capture, payment details, gift details, or full private records.

### Production readiness
Validate authentication/owner scoping, server-side plan enforcement, one-year Free history enforcement across read paths, image entitlement, import rollback, export authorization, AI point integration, CORS/OPTIONS where needed, trace headers, standard status values (`success`, `warning`, `error`, `skipped`), secret handling, and sensitive-data exclusion from operational events.

## Acceptance criteria
1. Validated JSON can create People without manual per-person entry.
2. Invalid import never silently creates malformed partial data.
3. Free and Pro can export owned data.
4. Subscription/image/history entitlements are server-enforced.
5. Free and Pro can purchase AI points with plan-specific pricing.
6. SNS handoff is explicit and privacy-minimized.
7. Platform Admin observes operational health without private guest content.
8. Health/version/contracts endpoints are contract-compliant.
