-- Refactor Velvet away from Customer / Sales / Payment canonical ownership.
-- Growth Engine owns Customer, Reservation/Visit Schedule, Payment and Sales.
-- Velvet stores only professional memory and professional visit records keyed by customer_id.

create table if not exists velvet_customer_memories (
  id text primary key,
  workspace_id text not null,
  user_id text not null,
  customer_id text not null,
  display_name_snapshot text,
  personality_note text,
  preference_note text,
  caution_note text,
  conversation_summary text,
  last_interaction_summary text,
  next_topic_hint text,
  tags jsonb not null default '[]'::jsonb,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id, customer_id)
);
create index if not exists velvet_customer_memories_scope_idx
  on velvet_customer_memories(workspace_id, user_id, customer_id);

create table if not exists velvet_professional_visits (
  id text primary key,
  workspace_id text not null,
  user_id text not null,
  customer_id text not null,
  reservation_id text,
  visit_schedule_id text,
  visited_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_minutes integer,
  service_context text,
  seating_reason text,
  conversation_memo text,
  preference_memo text,
  caution_memo text,
  next_action_memo text,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not (reservation_id is not null and visit_schedule_id is not null))
);
create index if not exists velvet_professional_visits_scope_idx
  on velvet_professional_visits(workspace_id, user_id, customer_id, visited_at desc);

-- Old tables remain temporarily for migration/rollback only.
-- Application code must stop creating canonical Person, Sales or Payment records in them.
comment on table velvet_people is 'LEGACY: do not use as Customer master. Migrate to velvet_customer_memories keyed by Growth Engine customer_id.';
comment on table velvet_visits is 'LEGACY: do not store Sales/Payment canonical fields. Migrate professional visit data to velvet_professional_visits.';
