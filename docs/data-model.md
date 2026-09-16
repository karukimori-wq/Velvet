# Velvet Data Model v1.0

The current production persistence target is Cloudflare D1. `cloudflare/schema.sql` is the executable D1 schema; this document explains ownership and semantics.

## Identity
Private professional rows are scoped by `workspace_id + user_id` and customer-related rows also carry Growth Engine `customer_id`. `owner_user_id` is used for owner-level entitlement/preferences where appropriate. `professionalId` is not required for MVP.

## Current D1 tables
- `velvet_owner_entitlements`: local Free/Pro/Business-compatible entitlement projection; not payment truth.
- `velvet_owner_preferences`: owner UX preferences such as `soon_alerts_enabled`.
- `velvet_customer_memories`: professional memory keyed by Growth Engine `customer_id`; not a Customer master.
- `velvet_professional_visits`: Velvet Visit history with optional Growth Engine reservation/schedule references; no canonical sales/payment fields.
- `velvet_professional_timeline`: customer-specific professional event timeline.
- `velvet_professional_next_actions`: Pro follow-ups, including optional `due_at`.
- `velvet_professional_captures`: raw Capture input preserved before organization.
- `velvet_notes`: scoped professional note references/previews.
- `velvet_professional_gifts`: received/given gift memory.
- `velvet_professional_schedule_entries`: Velvet display/work-memory schedule entries and optional Growth Engine schedule references.
- `velvet_capture_dictionary`: learned reusable Capture suggestions.
- `velvet_self_investments`: lightweight self-investment tracking, separate from customer Sales/Payment.
- `velvet_professional_relationships`: explicit customer-reference relationships.
- `velvet_roundtrip_checks`: operational persistence verification only.

## Media
Pro media bytes live in R2 binding `MEDIA` / bucket `velvetmedia`. Customer timeline metadata stores the authorized reference used by the application. Free upload is rejected server-side.

## Plan access
Free: customer limit 30; rolling 3-month visible history; no integrated all-history timeline.

Pro: no Velvet customer-count limit; full retained history; integrated timeline; voice, follow-up, images, export and other Pro capabilities defined in `docs/plan-enforcement-spec.md`.

Records outside the Free visibility window are not deleted merely because they are hidden. Upgrade may restore access according to current retention policy.

## Canonical exclusions
Do not add canonical Customer, Reservation, Payment, Sales/Revenue, receivable, or customer-sales aggregate tables to Velvet. Those belong to Growth Engine. Do not add an AI usage ledger; AI Platform Core owns AI usage.

## Privacy
Raw Capture, professional notes, relationship memory, media and other private customer context must not be copied into logs, analytics, Platform Admin, or cross-app payloads except for minimum fields explicitly allowed by contract.
