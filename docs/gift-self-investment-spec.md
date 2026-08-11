# Velvet Gift & Self-investment Specification v1.0

## Gift

### Direction
- received
- given

### Minimum data
- personId
- direction
- item
- date defaults to current date when recorded from person context

### Optional data
- occasion
- estimatedValue
- memo
- mediaAssetId (Pro only)

### UX
- From Person, tap Gift.
- Choose received/given.
- Show person-specific and user-level recent/frequent item suggestions.
- If a suggestion is correct, target <=3 taps total.
- Amount/value is optional and must not block completion.
- Pro may attach an image; Free sees image capability as unavailable without losing the text record.

### Timeline
Gift entries appear chronologically in the Person timeline and are searchable within the user's plan window.

## Self-investment

### Purpose
Track lightweight investments in the user's own work, not household accounting and not tax filing.

### Categories
- beauty
- fashion
- photography_content
- learning
- maintenance
- other

### Minimum data
- category
- amount
- date

### Optional data
- memo
- related schedule entry
- media attachment only if later explicitly supported by plan/spec

### UX
- Quick flow: category -> recent/common amount -> done.
- Short Capture such as `ネイル 12000` may generate a candidate after user-triggered organization.
- Reuse recent amounts and category habits as suggestions.

## Safety / claims
Velvet must not tell users that an item is tax-deductible or provide tax filing conclusions in v1.0. Analysis may compare user-entered business metrics later, but must be clearly framed as product analytics, not financial or tax advice.
