# Velvet Data Model v0.1

This document translates the Velvet domain model into an implementation-oriented relational model. Exact database technology is intentionally not fixed yet.

## Scope and identity

Every business row must be scoped by `workspaceId` and/or `ownerUserId` according to the platform identity contract. v1.0 is individual-use; records are private to the owning user by default.

## Tables

### people
- `person_id` PK
- `workspace_id`
- `owner_user_id`
- `display_name` required
- `nickname` nullable
- `birthday` nullable
- `rank` nullable, user-defined
- `phone` nullable
- `email` nullable
- `line_handle` nullable
- `instagram_handle` nullable
- `x_handle` nullable
- `tiktok_handle` nullable
- `other_contacts_json` nullable
- `occupation` nullable
- `company` nullable
- `area` nullable
- `growth_customer_ref` nullable, future explicit mapping only
- `created_at`
- `updated_at`
- `archived_at` nullable

Do not require profile completion.

### person_images
Pro-only storage references.
- `person_image_id` PK
- `person_id` FK
- `image_type`: `profile | business_card | gift | bottle | other`
- storage reference, not raw binary in the row
- `created_at`

### visits
- `visit_id` PK
- `workspace_id`
- `owner_user_id`
- `started_at` required
- `ended_at` nullable
- `duration_minutes` nullable/derived
- `visit_context` nullable
- `sales_amount` nullable
- `currency` default `JPY`
- `payment_method` nullable
- `receivable_amount` nullable
- `receivable_status` nullable
- `nomination_type` nullable
- `accompaniment_flag` nullable
- `after_flag` nullable
- `memo` nullable
- `created_at`
- `updated_at`

`ended_at` and all business-detail fields are optional.

### visit_participants
- `visit_participant_id` PK
- `visit_id` FK
- `person_id` FK
- optional `participant_role`
- optional participant-specific amount/note when needed
- unique (`visit_id`, `person_id`)

### knowledge_entries
- `knowledge_id` PK
- `workspace_id`
- `owner_user_id`
- `person_id` FK
- `category`
- `value`
- `normalized_value` nullable
- `source_capture_id` nullable
- `effective_at` nullable
- `created_at`
- `updated_at`
- `archived_at` nullable

Recommended initial categories: occupation, company, hobby, favorite_drink, favorite_food, smoking, pet, topic, ng_topic, travel, schedule_fact, preference, freeform.

### relationships
- `relationship_id` PK
- `workspace_id`
- `owner_user_id`
- `from_person_id` FK
- `to_person_id` FK
- `relationship_type`
- `note` nullable
- `confirmed_by_user` required true for semantic relationship assertions
- `created_at`
- `updated_at`

Do not infer semantic relationships from co-visits alone.

### gifts
- `gift_id` PK
- `workspace_id`
- `owner_user_id`
- `person_id` FK
- `visit_id` nullable FK
- `direction`: `received | given`
- `item`
- `occasion` nullable
- `estimated_value` nullable
- `currency` default `JPY`
- `note` nullable
- `occurred_at`
- `created_at`

Images live in a separate Pro-only storage-reference table or generic attachment table.

### schedule_entries
- `schedule_entry_id` PK
- `workspace_id`
- `owner_user_id`
- `person_id` nullable FK
- `entry_type`
- `starts_at`
- `ends_at` nullable
- `all_day` boolean
- `recurrence_json` nullable
- `availability_json` nullable
- `note` nullable
- `created_at`
- `updated_at`

### self_investment_entries
- `self_investment_entry_id` PK
- `workspace_id`
- `owner_user_id`
- `category`
- `amount`
- `currency` default `JPY`
- `occurred_at`
- `note` nullable
- `created_at`
- `updated_at`

### captures
- `capture_id` PK
- `workspace_id`
- `owner_user_id`
- `person_id` nullable FK
- `visit_id` nullable FK
- `input_type`: `stamp | suggestion | text | voice`
- `raw_value` nullable
- `raw_text` nullable
- `transcript` nullable
- `status`: `raw | processing | confirmation_required | confirmed | failed`
- `ai_activity_ref` nullable
- `created_at`
- `updated_at`

### capture_candidates
- `capture_candidate_id` PK
- `capture_id` FK
- `candidate_type`: `knowledge | gift | schedule | visit | relationship | person_update | other`
- `candidate_payload_json`
- `confidence` nullable
- `decision`: `pending | accepted | rejected | edited`
- `created_at`
- `decided_at` nullable

AI candidates never become canonical domain records before user confirmation when inference is involved.

### dictionary_entries
- `dictionary_entry_id` PK
- `workspace_id`
- `owner_user_id`
- `category`
- `value`
- `normalized_value` nullable
- `usage_count`
- `last_used_at`
- `created_at`
- `updated_at`
- unique suggested on (`owner_user_id`, `category`, `normalized_value`)

### plan_access
Velvet-local feature access only; not AI usage ledger.
- `workspace_id`
- `owner_user_id`
- `plan`: `free | pro`
- `history_window_days` nullable; Free target 365, Pro unlimited/null semantics
- `image_enabled`
- `created_at`
- `updated_at`

AI usage and point accounting remain canonical in AI Platform Core.

## Retention behavior

Free historical visibility is a rolling one-year product-access rule, not destructive deletion. Queries for historical surfaces must enforce the current plan window. Data outside the visible window should remain archived/retained according to the production storage policy unless the user deletes it.

## Suggested indexes

- people (`owner_user_id`, `display_name`)
- visits (`owner_user_id`, `started_at` desc)
- visit_participants (`person_id`, `visit_id`)
- knowledge_entries (`person_id`, `category`)
- knowledge_entries (`owner_user_id`, `normalized_value`)
- gifts (`person_id`, `occurred_at` desc)
- schedule_entries (`owner_user_id`, `starts_at`)
- dictionary_entries (`owner_user_id`, `category`, `usage_count` desc, `last_used_at` desc)

## Privacy and deletion

User export must include the user's canonical Velvet records in a documented JSON format. User deletion must be capable of removing or anonymizing associated private records and stored image references according to the final privacy policy.
