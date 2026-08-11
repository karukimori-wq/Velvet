# Velvet Billing and AI Points v0.1

## Plans

### Free
- Price: JPY 0/month
- People: unlimited
- Core Capture, stamps, learned suggestions: available
- Basic search: available
- Historical access for visit/sales/gift/memory: rolling 1 year
- Images: unavailable
- JSON import/export: available
- AI points: purchasable at higher unit price

### Pro
- Target price: JPY 10,000/month
- People: unlimited
- Full historical access
- Images: available subject to storage limits
- Advanced search/analysis where implemented
- Eligible SNS Planner integration
- AI points: purchasable at lower unit price

## AI point principles
1. AI is point-metered on both Free and Pro.
2. Pro does not include unlimited AI by default.
3. Free users can buy points so the free product remains fully explorable.
4. Pro receives a better point price, not a fundamentally different AI engine.
5. Point consumption must be visible but not interrupt every action with a confirmation dialog.
6. Show a low-balance warning only when useful.
7. If a capability cannot run because of insufficient points, fail before sending the AI request.
8. AI usage accounting remains canonical in AI Platform Core.

## Suggested capability charging model
Exact prices are not fixed in v0.1. Define relative cost classes first:

- Class S: lightweight structuring/classification
- Class M: natural-language retrieval or moderate context processing
- Class L: advanced analysis or larger-context generation

The UI should display the final point cost before an explicitly expensive action where surprise would be material, while routine low-cost Capture organization should avoid repetitive modal confirmation.

## Storage plan principle
Free intentionally avoids image storage. Pro image storage must have a documented practical cap and compression policy rather than marketing it as technically unlimited.

## Historical access
Free's one-year rule is an access-window rule, not automatic deletion. Older records should remain archived where policy and storage permit, so upgrading to Pro can restore historical access.

## Subscription source of truth
The billing provider and final subscription ownership model must be documented before implementation. Velvet must not invent payment state in AI Platform Core or Platform Admin.
