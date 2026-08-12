create table if not exists velvet_professional_timeline (
  id text primary key,
  workspace_id text not null,
  user_id text not null,
  customer_id text not null,
  occurred_at timestamptz not null default now(),
  event_type text not null,
  title text not null,
  body text,
  source_ref text,
  created_at timestamptz not null default now()
);
create index if not exists velvet_professional_timeline_scope_idx
  on velvet_professional_timeline(workspace_id, user_id, customer_id, occurred_at desc);
