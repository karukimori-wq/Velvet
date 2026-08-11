# Velvet Plan Enforcement Specification v1.0

## Principle
Plan limits are product rules and must be enforced server-side. UI hiding alone is insufficient.

## Free historical window
The Free plan may access a rolling one-year window for protected historical detail such as Visit, Gift, Knowledge and timeline history.

Rules:
- calculate the visible boundary from current date/time in the user's timezone
- records older than the boundary are not deleted by default
- list/count responses must not leak protected historical detail
- search, timeline, export-preview, direct-by-id endpoints and natural-language retrieval must all apply the same visibility rule unless export policy explicitly allows full owned-data export
- locked historical rows may be represented only by a neutral archive boundary, not private content snippets

## Export exception
The product principle is that users can retrieve their own data. Therefore export may include owned archived records even on Free, subject to security/privacy controls. Export is not equivalent to in-app historical browsing.

## Images
Free:
- no server-side MediaAsset creation/upload
- reject direct upload API calls with a plan error
- existing Pro images after downgrade require a separate downgrade retention policy before production; do not silently delete

Pro:
- image upload allowed within configured file/count/storage limits

## AI points
Both plans may purchase AI points.
- Free uses a higher unit price
- Pro uses a lower unit price
- AI usage ledger/source of truth remains AI Platform Core
- Velvet may cache display balance but cannot independently mint or reconcile canonical usage

## Error model
Plan errors use the common API status/error shape. Example codes:
- PLAN_UPGRADE_REQUIRED
- HISTORY_WINDOW_LIMIT
- IMAGE_NOT_AVAILABLE_ON_PLAN
- AI_POINTS_INSUFFICIENT

Do not use manipulative blocking copy. Explain the unavailable capability and the relevant plan plainly.

## Tests
Mandatory coverage:
- direct record lookup older than one year on Free
- timeline pagination crossing the boundary
- standard search and natural-language search respecting the boundary
- image upload bypass attempt on Free
- Pro full-history access
- downgrade behavior once policy is finalized
