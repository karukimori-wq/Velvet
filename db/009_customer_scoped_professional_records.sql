-- Responsibility-boundary completion: all new Velvet professional records use Growth Engine customerId references.
-- Legacy person-based tables remain read-only for migration/rollback only.

create table if not exists velvet_professional_captures (
  id text primary key,
  workspace_id text not null,
  user_id text not null,
  customer_id text,
  kind text not null,
  raw_text text not null,
  created_at timestamptz not null default now()
);
create index if not exists velvet_professional_captures_scope_idx on velvet_professional_captures(workspace_id, user_id, customer_id, created_at desc);

create table if not exists velvet_professional_gifts (
  id text primary key,
  workspace_id text not null,
  user_id text not null,
  customer_id text not null,
  direction text not null check (direction in ('received','given')),
  item text not null,
  occasion text,
  memo text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists velvet_professional_gifts_scope_idx on velvet_professional_gifts(workspace_id, user_id, customer_id, occurred_at desc);

create table if not exists velvet_professional_schedule_entries (
  id text primary key,
  workspace_id text not null,
  user_id text not null,
  customer_id text,
  visit_schedule_id text,
  entry_type text not null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists velvet_professional_schedule_scope_idx on velvet_professional_schedule_entries(workspace_id, user_id, customer_id, starts_at);

create table if not exists velvet_professional_relationships (
  id text primary key,
  workspace_id text not null,
  user_id text not null,
  customer_a_id text not null,
  customer_b_id text not null,
  relation_type text not null,
  note text,
  created_at timestamptz not null default now(),
  check (customer_a_id <> customer_b_id)
);
create index if not exists velvet_professional_relationships_scope_a_idx on velvet_professional_relationships(workspace_id, user_id, customer_a_id);
create index if not exists velvet_professional_relationships_scope_b_idx on velvet_professional_relationships(workspace_id, user_id, customer_b_id);
