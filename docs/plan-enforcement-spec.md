# Velvet Plan Enforcement Specification v1.2

## Release scope
Velvet launches with **Free** and **Pro**.

`business` remains a reserved platform PlanId for future compatibility, but Business is **not purchasable, publicly exposed, or enabled in Velvet for this release**. Future Business capabilities must use Growth Engine canonical business data and must not be implemented opportunistically inside Velvet.

## Commercial decision
Velvet Pro is positioned at **990 JPY / month** for this release. The billing system remains the source of truth for active subscription state; product code must not use the displayed price as an entitlement source.

## Principle
Plan limits are product rules and must be enforced server-side. UI hiding alone is insufficient.

Velvet's paid value is not “AI for its own sake.” Pro should make customer memory easier to keep, easier to search, and harder to forget.

## Free
- up to 30 managed customers
- protected history is visible for a rolling **3-month** window
- users can register dated interactions/events, but Free does not provide the integrated all-history timeline experience
- event-by-event detail remains accessible only when it is inside the allowed history window and otherwise must not leak private content
- basic keyword search across currently visible customer/profile information
- text input and stamp input for lightweight records
- basic AI organization where explicitly allowed by the current AI usage policy

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
- advanced search over retained customer memory, conversations, gifts and timeline records
- voice-assisted capture: speech input is a Pro convenience because the value is speech → keyword extraction → structured memory
- message draft generation is Pro-only
- follow-up management is Pro-only
- reminder MVP is “期限付きフォローとして表示” only; push/email notification is not required for the first Free / Pro release
- customer images / attachments
- JSON export
- “思い出す” remains the user-facing recall label for both Free and Pro; Pro may show a richer recall brief using full history, follow-ups, visit cadence and warnings
- “そろそろ” is Pro-only and uses Velvet-owned visit history to estimate customer visit cadence and surface customers who are later than usual

## Search boundary
Search must be split intentionally:

Free:
- simple keyword search only
- search targets must respect the Free 3-month visibility window
- no AI-dependent natural-language interpretation is required

Pro:
- advanced keyword and/or natural-language-like search may use AI Platform Core when configured
- the product may also implement natural-language-feeling search through deterministic keyword decomposition before using AI
- full retained history can participate in search results

## Voice input boundary
Voice input is a **Pro feature** in Velvet because its product value depends on turning spoken memory into structured keywords and long-term recall.

Free users should still be able to type and use stamps. UI copy must not imply that Free records are less valuable; it should position voice as a faster Pro capture method.

## Message draft boundary
Message draft generation is **Pro-only**.

Velvet may create drafts for LINE, Instagram DM, email, SMS or other channels, but Velvet does not auto-send messages in the MVP. Generated copy must be reviewed by the user before sending.

## Sorting boundary
Customer pinning is not part of the core product direction and should not be promoted as a plan differentiator. Customer list value should come from better sorting and discovery instead.

MVP sorting:
- name / default
- latest visit first
- most visits first

Money-based sorting, such as average amount or highest single amount, must not be calculated from Velvet-owned data unless the current contracts explicitly allow it. Sales, payment and revenue truth belongs to Growth Engine. A future Business feature may consume Growth Engine-owned aggregates for those sorts.

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
- full dormant-customer analysis using sales, reservations, payments or campaign performance is Business/Growth Engine territory

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
- voice capture UI is not available to Free users
- message draft generation is rejected for Free users
- image upload bypass attempt on Free
- customer pinning is not promoted as a core list-ordering strategy
- Business purchase/public capability remains unavailable
- downgrade behavior once retention policy is finalized
