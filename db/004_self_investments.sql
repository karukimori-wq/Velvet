create table if not exists velvet_self_investments (
  id text primary key,
  owner_user_id text not null,
  occurred_at timestamptz not null default now(),
  category text not null,
  amount integer not null check (amount >= 0),
  memo text,
  created_at timestamptz not null default now()
);

create index if not exists velvet_self_investments_owner_occurred_idx
  on velvet_self_investments(owner_user_id, occurred_at desc);
