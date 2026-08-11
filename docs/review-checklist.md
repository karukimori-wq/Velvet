# Velvet Review Checklist

Use this checklist for every meaningful implementation change.

## Product / UX
- Does the change reduce or at least not increase recurring user effort?
- Can common actions still complete within the expected tap budget?
- Does the UI avoid unnecessary keyboard use?
- Are optional fields truly optional?
- Are empty/unknown Person fields hidden in recall view?
- Does Person Detail prioritize personality and timeline?
- Is the screen useful for rapid recall when a guest arrives?
- Did the change accidentally introduce unsolicited coaching or pushy AI behavior?
- Are forms fallback/edit surfaces rather than the primary frequent path?

## Person / Memory
- Are appearance/accessory/marital-status memories displayed only when explicitly stored/confirmed?
- Are uncertain/sensitive traits never inferred from appearance alone?
- Are remembered traits concise and searchable where appropriate?
- Are timeline items concise, chronological, and easy to scan?

## Visit
- Can Visit start use current time without a setup form?
- Can Visit end in one tap from the active state?
- Is duration derived automatically?
- Can departure remain unknown?
- Are detailed sales/payment/order fields optional?
- Are multi-person shared values entered once?
- Is seating reason stored as Visit context rather than permanent Person identity?

## Capture / AI
- Is raw Capture preserved before processing?
- Can deterministic stamp/choice actions avoid AI entirely?
- Are AI actions user-triggered?
- Are inferred mutations shown as candidates and confirmed before commit?
- Does AI failure preserve the user's original input and allow retry?
- Is AI branding kept secondary to the task itself?
- Is only minimum necessary context sent to AI Platform Core?

## Search
- Does ordinary search work without AI for common exact/keyword cases?
- Is natural-language AI search Pull-based and user-triggered?
- Does AI parse intent rather than receive an unrestricted private customer dataset?
- Are Free historical visibility rules enforced consistently in search results?

## Plans / Billing
- Are People unlimited for both plans?
- Is Free one-year historical access enforced server-side on every read path?
- Is Free image upload rejected server-side?
- Is Pro full-history/image entitlement server-side?
- Can Free and Pro both buy AI points with plan-specific pricing?
- Is AI Platform Core still canonical for AI usage accounting?
- Is export not blocked merely to create lock-in?

## Security / Privacy
- Is every private query scoped by authenticated owner/workspace identity?
- Can a guessed ID reveal another user's record?
- Are PII/raw Capture/private relationships/payment/receivable details absent from logs and operational events?
- Are secrets absent from client code and responses?
- Are images authorization-protected?
- Does import/export enforce owner scope?

## Cross-app contracts
- Is Velvet Person/Guest kept distinct from Growth Engine Customer?
- Does Velvet avoid overwriting Growth Engine canonical Customer/Payment/Sales state?
- Does SNS Planner receive only user-selected minimum context/references?
- Does Platform Admin receive only operational data?
- Are traceId/correlationId/requestId preserved?
- Are observability statuses limited to `success`, `warning`, `error`, `skipped`?

## Import / Export
- Is import schema versioned?
- Is import validated before write?
- Is there a preview before commit?
- Is malformed partial write impossible or safely rollback-capable?
- Is duplicate handling explicit rather than silent name-based merge?
- Can users export their own data under the documented policy?

## Release blockers
Reject the change/release if it introduces any of the following:
- cross-user data access
- silent destructive plan downgrade
- AI mutation without required confirmation
- raw Capture loss
- hidden alternate path around Free history/image enforcement
- private guest content in Platform Admin/logs/events
- source-of-truth conflict with professional-platform-contracts
- silent malformed partial import
- Person recall UI filled with empty field labels or long form-like sections
