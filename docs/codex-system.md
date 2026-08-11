# Codex System Instructions — Velvet

You are implementing Velvet, a mobile-first personal sales assistant for individual night-work professionals.

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

Also follow `professional-platform-contracts` for cross-app ownership and identity rules.

## Non-negotiable UX rules
1. Common actions should normally complete within three taps.
2. Avoid opening the keyboard unless needed.
3. Never require optional data before completing a Visit or Person flow.
4. Do not show empty Person fields in the recall view.
5. Person Detail is optimized for rapid recall when the guest arrives.
6. Prioritize, in order: identity header, personality/remembered traits, quick actions, timeline.
7. Personality must show only known information. Never render rows such as `未入力`.
8. Timeline is a primary surface, not a secondary audit screen.
9. AI-derived uncertain changes require user confirmation before becoming canonical Velvet data.
10. Never discard raw Capture input when parsing/AI fails.
11. Suggestions may be ranked, but uncertain values are not silently auto-committed.
12. The home screen must not foreground unsolicited `today you should...` recommendations.

## Person recall view
The Person Detail view must help the user remember someone in seconds.

Known personality/context may include:
- occupation/company
- interests/hobbies
- favorite drinks/food
- NG topics
- marital-status value if entered
- appearance memories such as hairstyle, hair color, clothing/style, facial features, glasses
- accessories/belongings such as watch, watch brand, wallet brand, jewelry
- useful user-entered personality traits

Hide any unknown item entirely.

Timeline may include:
- visits
- seating reason
- sales/payment summary where permitted in Velvet
- gifts received/given
- Capture-derived memory
- schedule events
- relationships/referrals

Keep entries concise and newest-first by default.

## Visit rules
- Start uses current timestamp.
- End is one tap from active Visit and calculates duration.
- Departure may remain unknown.
- Shared multi-person Visit data is entered once.
- Seating reason is Visit context, not a permanent Person property.
- Supported seating reasons may include new, nomination, in-store nomination, help for another cast member, accompaniment, free/rotation, other.

## AI rules
AI is user-triggered and utility-oriented.

Prefer deterministic local behavior for:
- timestamps
- duration
- explicit stamp selections
- exact saved values
- simple ranked recent/frequent suggestions

Use AI Platform Core only where interpretation adds real value, such as:
- structuring ambiguous text/voice Capture
- natural-language search intent parsing

Do not send full private datasets when references or scoped context are sufficient.

## Data ownership
Velvet owns its personal Person/Guest domain and related Visit/Knowledge/Relationship/Gift/Schedule/Capture data.

Do not treat Velvet Person as Growth Engine Customer.
Do not create an independent canonical AI usage ledger in Velvet.
Do not send private guest datasets automatically to SNS Planner.
Do not expose private guest content to Platform Admin.

## Plan rules
Free:
- People unlimited
- one-year historical UI access
- no images
- AI points purchasable at higher unit price
- JSON import/export allowed

Pro:
- target JPY 10,000/month
- full history
- images
- eligible advanced/integration features
- lower AI point unit pricing

All entitlement and historical-access enforcement must be server-side.

## Coding behavior
- Prefer small composable functions/components.
- Keep domain logic outside visual components.
- Use stable typed identifiers and enums.
- Preserve traceId/correlationId/requestId through integrations.
- Observability top-level status is one of `success`, `warning`, `error`, `skipped`.
- Do not log PII, raw Capture, payment/receivable details, private relationship data, or images.
- Do not invent new cross-app contracts locally; update/consult professional-platform-contracts.

## Implementation order
Follow the current sprint scope. Do not opportunistically implement later-sprint features merely because they are easy.

When a specification appears to conflict, prioritize:
1. latest explicit product requirement
2. product principles / Person recall spec
3. current sprint
4. general older specification

If a conflict remains, implement the option that reduces recurring user effort without weakening privacy, ownership, or correctness.
