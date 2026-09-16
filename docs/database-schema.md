# Velvet Database Schema v1.0

`cloudflare/schema.sql` is the executable Cloudflare D1 schema for current production. PostgreSQL migrations remain compatibility/development assets and must not override the D1 production contract.

## Scope
Customer-related professional data uses `workspace_id`, `user_id`, and Growth Engine `customer_id`. Owner-level settings/entitlements use `owner_user_id`. Every read/write must enforce the authenticated scope server-side.

## Tables
### `velvet_customer_memories`
Professional memory snapshot only. `customer_id` references Growth Engine Customer. `display_name_snapshot` is not a competing Customer master. Legacy `pinned` may remain in storage for compatibility but pinning is not a promoted current UI feature.

### `velvet_professional_visits`
Velvet-owned interaction history: `visited_at`, optional `ended_at`/duration, service/seating/conversation/preference/caution/next-action/summary fields, plus optional `reservation_id` and `visit_schedule_id` references. No canonical sales/payment columns.

### `velvet_professional_timeline`
Chronological customer memory with `event_type`, title/body and optional `source_ref`.

### `velvet_professional_next_actions`
Follow-up text/status with optional `due_at` and `completed_at`. Production workflow conditionally adds `due_at` for older D1 databases before applying the schema.

### `velvet_professional_captures`
Raw user input with kind/text/timestamp. Preserve before AI organization.

### `velvet_professional_gifts`
Gift direction/item/occasion/memo/occurred timestamp as professional memory.

### `velvet_professional_schedule_entries`
Velvet display schedule with optional customer and Growth Engine `visit_schedule_id` reference.

### `velvet_capture_dictionary`
Normalized reusable suggestions with usage count and last-used timestamp.

### `velvet_professional_relationships`
Explicit relationship memory between two Growth Engine customer references.

### `velvet_owner_entitlements`
Local plan projection (`free | pro | business`) and status. Billing/payment truth is external.

### `velvet_owner_preferences`
Owner UX preferences, currently including `soon_alerts_enabled`.

### `velvet_notes`, `velvet_self_investments`, `velvet_roundtrip_checks`
Scoped professional notes, lightweight self-investment entries, and operational persistence verification respectively.

## R2
Media bytes are not stored in D1. Pro media uses R2 binding `MEDIA`, bucket `velvetmedia`; authorization is checked against owner/customer-scoped metadata before retrieval/deletion.

## Excluded schema
Never add a Velvet Customer master, Payment ledger, Sales/Revenue ledger, receivable ledger, or canonical Reservation table without a new approved platform contract. Growth Engine owns those domains. AI Platform Core owns AI usage/activity.

## Plan retention
Free history visibility is rolling 3 months and non-destructive. Pro can access retained full history. Free image creation/upload and Free export are blocked according to current plan policy.
