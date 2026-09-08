# Velvet Plan Enforcement Specification v1.1

## Release scope
Velvet launches with **Free** and **Pro**.

`business` remains a reserved platform PlanId for future compatibility, but Business is **not purchasable, publicly exposed, or enabled in Velvet for this release**. Future Business capabilities must use Growth Engine canonical business data and must not be implemented opportunistically inside Velvet.

Pricing is not authoritative in this document and must not be hard-coded into product contracts.

## Principle
Plan limits are product rules and must be enforced server-side. UI hiding alone is insufficient.

## Free
- up to 30 managed customers
- protected history is visible for a rolling **3-month** window
- users can still register dated interactions/events, but Free does not provide the integrated all-history timeline experience
- event-by-event detail remains accessible only when it is inside the allowed history window and otherwise must not leak private content
- integrated timeline and event-oriented aggregate views are Pro capabilities

The three-month boundary must be applied consistently to Visit, Gift, Knowledge/memory and professional timeline history.

Rules:
- calculate the visible boundary from current date/time
- records older than the boundary are not deleted by default
- list/count responses must not leak protected historical detail
- search, timeline, direct-by-id endpoints and natural-language retrieval must all apply the same visibility rule unless an explicit export policy says otherwise
- locked historical rows may be represented only by a neutral archive boundary, not private content snippets

## Pro
- no customer-count limit imposed by Velvet plan policy
- full retained history
- integrated chronological timeline
- event views alongside the timeline
- advanced recall/search and the Pro capabilities defined by current product requirements

## Export
Export behavior must follow the current product requirement and security/privacy policy. Do not use export as a bypass for protected in-app history unless explicitly approved by the current product specification.

## Images / attachments
Free:
- no server-side MediaAsset creation/upload
- reject direct upload API calls with a plan error
- existing Pro images after downgrade require an explicit retention policy before production; do not silently delete

Pro:
- image upload allowed within configured file/count/storage limits

## AI
AI usage is routed through AI Platform Core. Velvet must not independently mint or reconcile canonical AI usage.

Plan-specific AI entitlement and usage decisions must remain compatible with professional-platform-contracts and AI Platform Core. AI must not become the primary Velvet product surface; it should reduce taps, typing, repeated entry and recall effort.

## Business reservation
`business` may be recognized as a PlanId for contract compatibility, but:
- purchase is unavailable
- public upgrade/purchase UI is unavailable
- `business.integrations` remains disabled
- Velvet must not copy Growth Engine Customer, Reservation, Payment, Sales or Revenue canonical data into a competing source of truth

## Error model
Plan errors use the common API status/error shape. Example codes:
- PLAN_UPGRADE_REQUIRED
- CUSTOMER_LIMIT_REACHED
- HISTORY_WINDOW_LIMIT
- IMAGE_NOT_AVAILABLE_ON_PLAN
- AI_USAGE_LIMIT_REACHED

Do not use manipulative blocking copy. Explain the unavailable capability and the relevant plan plainly.

## Mandatory tests
- 31st customer creation is rejected on Free
- Pro customer creation is not blocked by the Free customer limit
- direct record lookup older than three months on Free
- timeline pagination crossing the three-month boundary
- standard search and natural-language search respecting the boundary
- Free cannot obtain an integrated all-history timeline
- Pro has full-history integrated timeline access
- image upload bypass attempt on Free
- Business purchase/public capability remains unavailable
- downgrade behavior once retention policy is finalized
