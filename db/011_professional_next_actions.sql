create table if not exists velvet_professional_next_actions (
  id text primary key,
  workspace_id text not null,
  user_id text not null,
  customer_id text not null,
  text text not null,
  status text not null default 'open' check (status in ('open','done')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists velvet_next_actions_customer_idx on velvet_professional_next_actions(workspace_id,user_id,customer_id,status,created_at desc);
