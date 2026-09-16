# Velvet

Velvet is a mobile-first professional customer-memory app. Its core loop is **覚える → 思い出す → 次につなぐ**. AI stays in the background and reduces typing, organization and search effort.

## Current release
Free + Pro are the release target. Business is reserved for future platform compatibility and is not purchasable/enabled now.

Primary surfaces:
- Home
- お客様 / Customer Detail
- 覚える / Capture
- Search
- Schedule
- Pro follow-up / `そろそろ`
- Pro media/export/message-draft capabilities

## Platform boundary
Growth Engine owns canonical Customer, Reservation/Visit Schedule, Payment and Sales/Revenue. Velvet owns professional memory/Visit/timeline/Capture/follow-up context keyed to Growth Engine `customerId`. AI Platform Core owns AI usage.

Current production target is Cloudflare Workers/OpenNext + D1 + R2 with Clerk authentication.

Start with `docs/current-product-contract.md`, then `docs/plan-enforcement-spec.md` and `docs/codex-system.md`. Older documents are subordinate when they conflict with those sources or current code.
